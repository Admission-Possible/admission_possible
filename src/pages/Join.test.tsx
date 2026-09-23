import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Join from './Join';
import { FIRST_GEN_OPTIONS, GRADES, INTERESTS } from '../data/join';
import { renderWithRouter } from '../test/utils';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/^first name/i), 'Ada');
  await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
};

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Join us' }));

describe('Join form', () => {
  it('shows an accessible error and does not submit when the email is invalid', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await user.type(screen.getByLabelText(/^first name/i), 'Ada');
    await user.type(screen.getByLabelText(/^email/i), 'not-an-email');
    await submit(user);

    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Thanks' })).not.toBeInTheDocument();
  });

  it('shows an error and does not submit when the first name is empty', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await submit(user);

    expect(screen.getByRole('alert')).toHaveTextContent(/first name/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Thanks' })).not.toBeInTheDocument();
  });

  // #29/#30: with no endpoint configured the form must still POST same-origin,
  // never hand student PII to a mail client pointed at someone else's domain.
  it('POSTs same-origin to /api/join by default and shows "Thanks" on success', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/join');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init.body)).toMatchObject({ first: 'Ada', email: 'ada@example.com' });

    expect(await screen.findByRole('button', { name: 'Thanks' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('never references a domain the project does not own', () => {
    renderWithRouter(<Join />);
    expect(document.body.innerHTML).not.toContain('admissionpossible.org');
  });

  it('offers the composed message for copying when delivery fails', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // The typed answers survive, rendered as copyable text.
    const fallback = screen.getByLabelText('Copy this and send it to us:') as HTMLTextAreaElement;
    expect(fallback.value).toContain('Ada');
    expect(fallback.value).toContain('ada@example.com');
  });

  it('copies the fallback message to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    // jsdom exposes navigator.clipboard as a getter-only property.
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    await user.click(await screen.findByRole('button', { name: 'Copy message' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain('ada@example.com');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('shows the retry state when the fetch rejects', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // #30: a double-click must not send two submissions.
  it('disables the submit button while a request is in flight', async () => {
    const user = userEvent.setup();
    let release!: (v: { ok: boolean }) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise((resolve) => (release = resolve)));
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    const sending = await screen.findByRole('button', { name: 'Sending' });
    expect(sending).toBeDisabled();

    await user.click(sending);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    release({ ok: true });
    expect(await screen.findByRole('button', { name: 'Thanks' })).toBeInTheDocument();
  });

  it('offers a configured contact address beside the fallback, and none when unset', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const { unmount } = renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);
    await screen.findByRole('button', { name: 'Try again' });
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
    unmount();

    vi.stubEnv('VITE_CONTACT_EMAIL', 'hi@example.test');
    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);
    const link = await screen.findByRole('link', { name: 'hi@example.test' });
    expect(link.getAttribute('href')).toMatch(/^mailto:hi@example\.test\?subject=/);
  });

  it('starts with grade blank and reads nothing from browser storage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    renderWithRouter(<Join />);
    expect(screen.getByLabelText(/^grade level/i)).toHaveValue('');
    expect(getItem).not.toHaveBeenCalled();
  });

  it('asks for grade, first-gen status, interests and needs', () => {
    renderWithRouter(<Join />);
    const grade = screen.getByLabelText(/^grade level/i);
    for (const g of GRADES) expect(within(grade).getByRole('option', { name: g })).toBeInTheDocument();

    const firstGen = screen.getByRole('radiogroup', { name: /first in your family to go to college/i });
    expect(
      within(firstGen)
        .getAllByRole('radio')
        .map((r) => r.getAttribute('value')),
    ).toEqual(FIRST_GEN_OPTIONS);

    for (const interest of INTERESTS) {
      expect(screen.getByRole('checkbox', { name: interest })).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/anything else we should know/i).tagName).toBe('TEXTAREA');
  });

  it('POSTs every field as JSON, with interests as an array', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await user.type(screen.getByLabelText(/^first name/i), '  Ada ');
    await user.type(screen.getByLabelText(/^last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await user.selectOptions(screen.getByLabelText(/^grade level/i), '11th grade');
    await user.click(screen.getByRole('radio', { name: 'Not sure' }));
    await user.click(screen.getByRole('checkbox', { name: 'Writing my essays' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ongoing mentorship' }));
    await user.type(screen.getByLabelText(/anything else/i), 'Evenings work best.');
    await submit(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      first: 'Ada',
      last: 'Lovelace',
      email: 'ada@example.com',
      grade: '11th grade',
      firstGen: 'Not sure',
      interests: ['Writing my essays', 'Ongoing mentorship'],
      needs: 'Evenings work best.',
    });

    // A delivered submission clears the form for the next student.
    expect(await screen.findByRole('button', { name: 'Thanks' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^first name/i)).toHaveValue('');
    expect(screen.getByRole('checkbox', { name: 'Writing my essays' })).not.toBeChecked();
  });

  it('sends empty optional fields rather than omitting them', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(<Join />);
    await fillValid(user);
    await submit(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      first: 'Ada',
      last: '',
      email: 'ada@example.com',
      grade: '',
      firstGen: '',
      interests: [],
      needs: '',
    });
  });

  it('includes first-gen status and interests in the copyable fallback', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    renderWithRouter(<Join />);
    await fillValid(user);
    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    await user.click(screen.getByRole('checkbox', { name: 'Building my college list' }));
    await submit(user);

    const fallback = (await screen.findByLabelText('Copy this and send it to us:')) as HTMLTextAreaElement;
    expect(fallback.value).toContain('First in family to go to college: Yes');
    expect(fallback.value).toContain('Looking for help with: Building my college list');
    // The typed answers survive in the form too.
    expect(screen.getByLabelText(/^first name/i)).toHaveValue('Ada');
  });

  it('returns the button to "Join us" after thanking the student', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
      renderWithRouter(<Join />);
      await fillValid(user);
      await submit(user);
      expect(await screen.findByRole('button', { name: 'Thanks' })).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByRole('button', { name: 'Join us' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  // #39: browser autofill exists for exactly these fields (WCAG 1.3.5).
  it('carries autocomplete tokens on the identity fields', () => {
    renderWithRouter(<Join />);
    expect(screen.getByLabelText(/^first name/i)).toHaveAttribute('autocomplete', 'given-name');
    expect(screen.getByLabelText(/^last name/i)).toHaveAttribute('autocomplete', 'family-name');
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('autocomplete', 'email');
  });

  it('marks the required fields before submission, visibly and programmatically', () => {
    renderWithRouter(<Join />);
    for (const field of [/^first name/i, /^email/i]) {
      const input = screen.getByLabelText(field);
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-required', 'true');
      // The label itself says so, not colour alone.
      expect(input).toHaveAccessibleName(/required/i);
    }
  });

  it('ties the error to the offending field and moves focus there', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());
    renderWithRouter(<Join />);

    // Empty first name.
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await submit(user);

    const first = screen.getByLabelText(/^first name/i);
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveAccessibleDescription(/first name/i);
    expect(first).toHaveFocus();
  });

  it('moves focus to the email field when only the email is invalid', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());
    renderWithRouter(<Join />);

    await user.type(screen.getByLabelText(/^first name/i), 'Ada');
    await user.type(screen.getByLabelText(/^email/i), 'not-an-email');
    await submit(user);

    const email = screen.getByLabelText(/^email/i);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/valid email/i);
    expect(email).toHaveFocus();
    // The name field, which is fine, is not flagged.
    expect(screen.getByLabelText(/^first name/i)).not.toHaveAttribute('aria-invalid');
  });
});
