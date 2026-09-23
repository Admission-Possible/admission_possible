import { Link } from 'react-router';
import { EditorialHero } from '../components/EditorialHero';

// Written to match what the code actually does today, not a template. If the
// data flow changes — a new endpoint, analytics, a cookie — this page changes
// in the same PR. Deliberately plain language: the readers are students, some
// of them 14, and their parents.
const UPDATED = 'September 2026';

export default function Privacy() {
  return (
    <main className="interior legal">
      <EditorialHero
        kicker="The details / Plain language"
        title="Privacy"
        tone="lavender"
        description={
          <>
            Plain version: the only thing you ever send us is the Join us form — because you filled it in and pressed
            the button. Last updated {UPDATED}.
          </>
        }
      />

      <section className="legal__sec">
        <h2 className="legal__h">What we collect</h2>
        <p>
          <strong>The Join us form.</strong> When you submit it we receive your first name, last name, email address,
          grade level, whether you are the first in your family to go to college (if you answer), the topics you tick,
          and whatever you write in "anything else we should know". This is the only information that reaches us. We use
          it to email you back. Nothing else.
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
          We count page views and whether a Join us form was sent, using Vercel Web Analytics. It sets no cookies,
          builds no profile, and cannot follow you to other sites. We see totals, not people.
        </p>
        <p>
          What you type into the form is never part of that, so nothing about your family or background is measured.
          There are no advertising pixels and no tracking cookies.
        </p>
        <p>
          The site loads nothing from anyone else's servers. Our fonts used to come from Google Fonts, which meant
          Google received your IP address on every page load; they are served from this site now, so that has stopped.
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
          Questions, or want your information deleted? Use the <Link to="/join">Join us form</Link> and say so — it
          reaches the same inbox.
        </p>
      </section>
    </main>
  );
}
