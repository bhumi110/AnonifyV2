import '../styles/home.css';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grain" />

        <div className="hero-content">

          <div className="hero-logo">
            <span className="logo-icon">🍵</span>
            <span className="logo-name">Anonify</span>
          </div>

          <h1 className="hero-h1">
            Spill the Tea
            <span className="l2">Anonymously</span>
          </h1>

          <p className="hero-sub">
            Share your drama, confessions, and get advice from the community.
            <br />
            No judgment, just real talk.&nbsp;💯
          </p>

          <div className="hero-btns">
            <a href="/create" className="btn-spill">
              Spill Now 🍵&nbsp;<i class="fa-solid fa-arrow-right-long"></i>
            </a>
            <a href="/feed" className="btn-browse">
              Browse Drama 👀
            </a>
          </div>

        </div>
      </section>

      <section className="how-section" id="how">
        <div className="sec-wrap">

          <div className="sec-head">
            <h2>How It Works</h2>
            <p>Three simple steps to get the advice you need</p>
          </div>

          <div className="steps-grid">

            <div className="step-card c-purple">
              <span className="s-icon">📝</span>
              <h3>1. Post</h3>
              <p>Share your story, drama, or question anonymously. No judgment zone.</p>
            </div>

            <div className="step-card c-cyan">
              <span className="s-icon">🔥</span>
              <h3>2. React</h3>
              <p>Community reacts with emojis and shows support or solidarity.</p>
            </div>

            <div className="step-card c-pink">
              <span className="s-icon">💬</span>
              <h3>3. Advice</h3>
              <p>Get real advice and different perspectives from people who care.</p>
            </div>

          </div>
        </div>
      </section>

      <section className="why-section" id="why">
        <div className="sec-wrap">

          <div className="sec-head">
            <h2>Why Spill the Tea?</h2>
            <p>A safe space designed for Gen-Z to share, connect, and get real advice</p>
          </div>

          <div className="features-grid">

            <div className="feat">
              <div className="feat-ring">👤</div>
              <h3>100% Anonymous</h3>
              <p>Share without fear. Your identity stays completely private.</p>
            </div>

            <div className="feat">
              <div className="feat-ring">💬</div>
              <h3>Real Community</h3>
              <p>Get advice from people who actually understand your situation.</p>
            </div>

            <div className="feat">
              <div className="feat-ring">🤍</div>
              <h3>No Judgment</h3>
              <p>A supportive space where you can be your authentic self.</p>
            </div>

          </div>
        </div>
      </section>

      <section className="cta-section" id="spill">
        <div className="sec-wrap">
          <h2>Ready to Spill? ☕</h2>
          <p>Join thousands sharing their stories and getting real advice</p>
          <a href="#" className="btn-cta">
            Start Spilling 🍵&nbsp;→
          </a>
        </div>
      </section>

      <footer>
        <div className="foot-logo">
          <span className="logo-icon">🍵</span>
          <span className="logo-name">Anonify</span>
        </div>

        <div className="foot-links">
          <a href="#">About</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Guidelines</a>
        </div>

        <p className="foot-credit">Made with 💜</p>
      </footer>

    </>
  );
}