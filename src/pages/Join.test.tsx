import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Join from './Join';
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

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Join' }));

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

  it('shows a contact address only when one is configured', async () => {
    vi.stubEnv('VITE_CONTACT_EMAIL', 'hi@example.test');
    renderWithRouter(<Join />);
    const link = within(document.body).getByRole('link', { name: 'hi@example.test' });
    expect(link).toHaveAttribute('href', 'mailto:hi@example.test');
  });

  // #36: the intake already captured grade; Join asked for it again, blank.
  it('prefills grade from the stored intake', async () => {
    const { computePlan } = await import('../data/plan');
    const { saveIntake } = await import('../data/storage');
    saveIntake({ answers: {}, plan: computePlan({ grade: '11th grade' }) });

    renderWithRouter(<Join />);
    expect(screen.getByLabelText(/^grade level/i)).toHaveValue('11th grade');
  });

  it('leaves grade blank when there is no intake', () => {
    localStorage.clear();
    sessionStorage.clear();
    renderWithRouter(<Join />);
    expect(screen.getByLabelText(/^grade level/i)).toHaveValue('');
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
