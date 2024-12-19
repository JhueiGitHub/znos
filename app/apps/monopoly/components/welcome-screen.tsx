// To be placed in /root/app/apps/monopoly/components/WelcomeScreen.tsx
export default function WelcomeScreen() {
  return (
    <div className="entry">
      <nav>
        <button data-select="true" data-tooltip-hover="play">
          <img src="./icon.png" alt="" />
        </button>
        <button data-select="false" data-tooltip-hover="server">
          <img src="./server.png" alt="" />
        </button>
        <button
          data-select="false"
          data-tooltip-hover="account"
          disabled={true}
        >
          <img src="./human.png" alt="" />
        </button>
        <br />
        <button data-select="false" data-tooltip-hover="credits">
          <img src="./credits.png" alt="" />
        </button>
        <button data-select="false" data-tooltip-hover="settings">
          <img src="./settings.png" alt="" />
        </button>
      </nav>

      <main>
        <header>
          Welcome to the <h3>MONOPOLY</h3>
          <p
            style={{
              fontSize: 9,
              cursor: "pointer",
              opacity: 0.8,
              width: "fit-content",
            }}
          >
            @itaylayzer - 10.12.23
          </p>
          Game
        </header>

        <nav className="join">
          <button data-tooltip-hover="online" data-select="true">
            <img src="./online.png" alt="" />
          </button>
          <button data-tooltip-hover="computer" data-select="false">
            <img src="./bot.png" alt="" />
          </button>
        </nav>

        <br />

        <div>
          <p>please enter your code:</p>
          <input type="text" placeholder="enter code" />
        </div>

        <div>
          <p>please enter your name:</p>
          <input type="text" placeholder="enter name" />
        </div>

        <center>
          <button>join</button>
        </center>
      </main>
    </div>
  );
}
