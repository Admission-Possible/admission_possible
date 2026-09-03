import { Link } from 'react-router';

// Written to match what the code actually does today, not a template. If the
// data flow changes — a new endpoint, analytics, a cookie — this page changes
// in the same PR. Deliberately plain language: the readers are students, some
// of them 14, and their parents.
const UPDATED = 'September 2026';

export default function Privacy() {
  return (
    <main className="interior legal">
      <div className="rule" />

      <div className="page-intro">
        <h1 className="subhead">Privacy</h1>
        <p className="page-intro__lede">
          Plain version: the answers you give in the intake stay on your own device, and the only thing you ever send us
          is the Join form — because you filled it in and pressed the button. Last updated {UPDATED}.
        </p>
      </div>

      <section className="legal__sec">
        <h2 className="legal__h">What we collect</h2>
        <p>
          <strong>The Join form.</strong> When you submit it we receive your first name, last name, email address, grade
          level, and whatever you write in "what do you need help with". This is the only information that reaches us.
          We use it to email you back. Nothing else.
        </p>
        <p>
          <strong>The 7-question intake.</strong> Your answers — including whether you're the first in your family to
          apply and whether you expect a Pell Grant — are saved <strong>in your browser on your device</strong> so your
          plan is still there when you come back. They are never sent to us, and we cannot see them. Clearing your
          browsing data deletes them permanently, and we have no copy to restore.
        </p>
      </section>

      <section className="legal__sec">
        <h2 className="legal__h">Where it goes</h2>
        <p>
          A Join submission is posted to this site's own server, which forwards it as an email to the team's inbox
          through <a href="https://resend.com/legal/privacy-policy">Resend</a>, an email delivery service. We do not
          sell it, trade it, or hand it to advertisers, data brokers, or schools.
        </p>
        <p>
          If that delivery fails, the form shows you your own message so you can copy it and send it yourself. In that
          case nothing has reached us at all.
        </p>
      </section>

      <section className="legal__sec">
        <h2 className="legal__h">Tracking</h2>
        <p>
          There is no analytics on this site, no advertising pixels, and no tracking cookies. We do not know who visits
          or what you click.
        </p>
        <p>
          One thing to be straight about: our page fonts load from Google Fonts, so Google's servers receive your IP
          address when a page loads, as they would on any site using them. We are moving to self-hosted fonts to remove
          that.
        </p>
      </section>

      <section className="legal__sec">
        <h2 className="legal__h">If you're under 18</h2>
        <p>
          This site is built for high school students, so many of you are minors. We ask only for what we need to write
          back to you, and never for a home address, phone number, date of birth, or any government or school ID number.
          If you'd rather a parent or guardian contact us instead of filling in the form yourself, that is completely
          fine.
        </p>
        <p>
          If you are a parent, guardian, or counselor and want a student's information deleted, email us and we will
          delete it and confirm.
        </p>
      </section>

      <section className="legal__sec">
        <h2 className="legal__h">How long we keep it</h2>
        <p>
          Join submissions live in our email inbox. We keep them while we are actually helping you and delete them on
          request. Ask us and it's gone — you don't have to give a reason.
        </p>
      </section>

      <section className="legal__sec">
        <h2 className="legal__h">Who we are</h2>
        <p>
          (Ad)mission Possible is a student-run project, not an incorporated nonprofit and not affiliated with any
          school, district, or other organization. We are also unaffiliated with College Possible, a separate nonprofit
          with a similar name.
        </p>
        <p>
          Questions, or want your information deleted? Use the <Link to="/join">Join form</Link> and say so — it reaches
          the same inbox.
        </p>
      </section>
    </main>
  );
}
