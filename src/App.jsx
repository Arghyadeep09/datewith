import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------
   Floating decoration component
------------------------------------------------------- */

function FloatingDecoration({ children, className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute select-none opacity-50 ${className}`}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------
   Main Application
------------------------------------------------------- */

function App() {
  const [step, setStep] = useState("booking");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     No button movement
  ------------------------------------------------------- */

  const [noOffset, setNoOffset] = useState({
    x: 0,
    y: 0,
  });

  const [noMessageIndex, setNoMessageIndex] = useState(0);

  const noButtonRef = useRef(null);

  /* Prevent the button from moving too frequently */
  const lastMoveTime = useRef(0);

  const noMessages = [
    "Nice try 😂",
    "You can't escape this question 😭",
    "The No button is scared of you 😂",
    "I think the button wants you to say YES ❤️",
    "Why are you chasing the No button? 😭",
    "Okay... this is getting embarrassing 😂",
    "Just say YES already 🥺❤️",
  ];

  /* -------------------------------------------------------
     Today's date
  ------------------------------------------------------- */

  const today = useMemo(() => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();

    const month = String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    );

    const day = String(currentDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* -------------------------------------------------------
     Move No button smoothly
  ------------------------------------------------------- */

  const moveNoButton = () => {
    const now = Date.now();

    /*
      Don't allow the button to jump continuously.
      This makes the movement feel deliberate and playful.
    */
    if (now - lastMoveTime.current < 700) {
      return;
    }

    lastMoveTime.current = now;

    /*
      Smaller movement range makes it glide rather
      than teleport across the screen.
    */
    const maxX = 130;
    const maxY = 65;

    let randomX =
      Math.floor(Math.random() * (maxX * 2 + 1)) - maxX;

    let randomY =
      Math.floor(Math.random() * (maxY * 2 + 1)) - maxY;

    /*
      Prevent almost identical positions.
    */
    if (
      Math.abs(randomX - noOffset.x) < 35 &&
      Math.abs(randomY - noOffset.y) < 25
    ) {
      randomX += randomX >= 0 ? 45 : -45;
      randomY += randomY >= 0 ? 30 : -30;
    }

    setNoOffset({
      x: randomX,
      y: randomY,
    });

    setNoMessageIndex(
      (previousIndex) =>
        (previousIndex + 1) % noMessages.length
    );
  };

  /* -------------------------------------------------------
     Return No button to original position
  ------------------------------------------------------- */

  const resetNoButton = () => {
    /*
      Don't reset if already at the original position.
    */
    if (noOffset.x === 0 && noOffset.y === 0) {
      return;
    }

    setNoOffset({
      x: 0,
      y: 0,
    });
  };

  /* -------------------------------------------------------
     Detect cursor proximity
  ------------------------------------------------------- */

  useEffect(() => {
    if (step !== "booking") {
      return;
    }

    const handlePointerMove = (event) => {
      const button = noButtonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;

      const distance = Math.sqrt(
        distanceX * distanceX + distanceY * distanceY
      );

      /*
        Only escape when the cursor gets genuinely close.
      */
      if (distance < 60) {
        moveNoButton();
      }

      /*
        When cursor moves far away, return gradually.
      */
      if (distance > 220) {
        resetNoButton();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, [step, noOffset]);

  /* -------------------------------------------------------
     Click YES
  ------------------------------------------------------- */

  const handleYes = () => {
    if (!date) {
      setError("Choose a date first 🥺❤️");
      return;
    }

    if (!time) {
      setError("And don't forget to choose a time 🥺");
      return;
    }

    setError("");

    setStep("countdown");
  };

  /* -------------------------------------------------------
     Create floating hearts
  ------------------------------------------------------- */

  const createFloatingHearts = () => {
    const hearts = [
      "❤️",
      "💕",
      "💗",
      "💖",
      "💘",
      "💝",
      "🌹",
      "✨",
      "🥰",
    ];

    const numberOfHearts = 45;

    for (let i = 0; i < numberOfHearts; i++) {
      const heart = document.createElement("div");

      heart.classList.add("floating-heart");

      heart.innerText =
        hearts[Math.floor(Math.random() * hearts.length)];

      heart.style.left = `${Math.random() * 100}vw`;

      heart.style.fontSize = `${
        16 + Math.random() * 25
      }px`;

      heart.style.animationDuration = `${
        3 + Math.random() * 4
      }s`;

      heart.style.animationDelay = `${
        Math.random() * 2
      }s`;

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 8500);
    }
  };

  /* -------------------------------------------------------
     Countdown
  ------------------------------------------------------- */

  useEffect(() => {
    if (step !== "countdown") {
      return;
    }

    const timer = setTimeout(() => {
      setStep("confirmed");

      createFloatingHearts();
    }, 3200);

    return () => clearTimeout(timer);
  }, [step]);

  /* -------------------------------------------------------
     Format selected date
  ------------------------------------------------------- */

  const formattedDate = useMemo(() => {
    if (!date) {
      return "";
    }

    const selectedDate = new Date(`${date}T00:00`);

    return selectedDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date]);

  /* -------------------------------------------------------
     Format selected time
  ------------------------------------------------------- */

  const formattedTime = useMemo(() => {
    if (!time) {
      return "";
    }

    const selectedTime = new Date(`2000-01-01T${time}`);

    return selectedTime.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [time]);

  /* =======================================================
     COUNTDOWN SCREEN
  ======================================================= */

  if (step === "countdown") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 px-5">
        <FloatingDecoration className="left-[8%] top-[15%] text-4xl">
          💕
        </FloatingDecoration>

        <FloatingDecoration className="right-[10%] top-[25%] text-5xl">
          💗
        </FloatingDecoration>

        <FloatingDecoration className="bottom-[15%] left-[15%] text-5xl">
          💖
        </FloatingDecoration>

        <FloatingDecoration className="bottom-[20%] right-[15%] text-4xl">
          💘
        </FloatingDecoration>

        <div className="text-center">
          <div className="mb-8 text-7xl float-slow">
            💌
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.4em] text-rose-500">
            Preparing something special
          </p>

          <h1 className="mb-10 text-4xl font-black text-rose-950 sm:text-6xl">
            Wait for it...
          </h1>

          <CountdownChanger />

          <p className="mt-6 text-lg text-slate-500">
            Your answer has been recorded ❤️
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     CONFIRMATION SCREEN
  ======================================================= */

  if (step === "confirmed") {
    return (
      <ConfirmationScreen
        formattedDate={formattedDate}
        formattedTime={formattedTime}
      />
    );
  }

  /* =======================================================
     BOOKING SCREEN
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
      {/* Decorative background */}

      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="absolute -bottom-40 -right-32 h-[450px] w-[450px] rounded-full bg-purple-300/30 blur-3xl" />

      <FloatingDecoration className="left-[8%] top-[12%] text-3xl">
        💕
      </FloatingDecoration>

      <FloatingDecoration className="right-[12%] top-[18%] text-4xl">
        💗
      </FloatingDecoration>

      <FloatingDecoration className="bottom-[15%] left-[12%] text-5xl">
        💖
      </FloatingDecoration>

      <FloatingDecoration className="bottom-[10%] right-[12%] text-4xl">
        🌹
      </FloatingDecoration>

      {/* Main card */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Top pill */}

          <div className="mb-8 flex justify-center">
            <div className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-500 shadow-sm">
              💌 A very important question
            </div>
          </div>

          {/* Main heading */}

          <div className="text-center">
            <div className="mb-5 text-7xl float-slow">
              🌹
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-rose-400">
              Dear beautiful
            </p>

            <h1 className="text-4xl font-black leading-tight text-rose-950 sm:text-6xl">
              Will you go on a
              <span className="block text-rose-500">
                dinner date
              </span>
              with me? ❤️
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
              Pick a date and time first.
              <br />
              I promise it'll be worth it. ✨
            </p>
          </div>

          {/* Date and Time */}

          <div className="mx-auto mt-10 grid max-w-xl gap-5 sm:grid-cols-2">
            {/* Date */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                📅 Our day
              </label>

              <input
                type="date"
                min={today}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
                className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-4 text-slate-700 outline-none transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>

            {/* Time */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                🕐 Our time
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value);
                  setError("");
                }}
                className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-4 text-slate-700 outline-none transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 px-5 py-3 text-center text-sm font-semibold text-rose-500">
              {error}
            </div>
          )}

          {/* Buttons */}

          <div className="relative mx-auto mt-12 h-36 max-w-md">
            {/* YES */}

            <button
              type="button"
              onClick={handleYes}
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-12 py-4 text-lg font-black text-white shadow-xl shadow-rose-300/50 transition duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            >
              YES! 💖
            </button>

            {/* NO */}

            <button
              ref={noButtonRef}
              type="button"
              onMouseEnter={moveNoButton}
              onFocus={moveNoButton}
              onClick={moveNoButton}
              style={{
                transform: `translate(
                  calc(-50% + ${noOffset.x}px),
                  calc(-50% + ${noOffset.y}px)
                )`,

                /*
                  Slow smooth movement.
                */
                transition:
                  "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",

                willChange: "transform",
              }}
              className="absolute left-[75%] top-1/2 z-30 rounded-full border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-500 shadow-lg"
            >
              No 😭
            </button>
          </div>

          {/* Funny message */}

          <div className="mt-2 min-h-[28px] text-center">
            <p className="text-sm italic text-slate-400 transition-all duration-500">
              {noOffset.x !== 0 || noOffset.y !== 0
                ? noMessages[noMessageIndex]
                : "Choose your date... I'll be waiting ❤️"}
            </p>
          </div>

          {/* Footer */}

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-medium text-slate-400 shadow-sm">
              Made with way too much love ❤️
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   Countdown Component
========================================================= */

function CountdownChanger() {
  const [number, setNumber] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumber((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          return 1;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={number}
      className="countdown-number text-8xl font-black text-rose-500"
    >
      {number}
    </div>
  );
}

/* =========================================================
   Confirmation Screen
========================================================= */

function ConfirmationScreen({
  formattedDate,
  formattedTime,
}) {
  const handleSaveDate = () => {
    window.print();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 px-4 py-10">
      {/* Background decoration */}

      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="absolute -bottom-40 -right-32 h-[450px] w-[450px] rounded-full bg-purple-300/30 blur-3xl" />

      <FloatingDecoration className="left-[8%] top-[15%] text-4xl">
        💕
      </FloatingDecoration>

      <FloatingDecoration className="right-[10%] top-[18%] text-5xl">
        💗
      </FloatingDecoration>

      <FloatingDecoration className="bottom-[18%] left-[12%] text-5xl">
        💖
      </FloatingDecoration>

      <FloatingDecoration className="bottom-[12%] right-[12%] text-4xl">
        🌹
      </FloatingDecoration>

      {/* Confirmation card */}

      <div className="confirmation-card relative z-10 w-full max-w-xl rounded-[2.5rem] border border-white/70 bg-white/85 p-7 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        {/* Emoji */}

        <div className="mb-5 text-7xl float-slow">
          🥰
        </div>

        {/* Label */}

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-rose-500">
          It's official
        </p>

        {/* Heading */}

        <h1 className="mb-4 text-4xl font-black text-rose-950 sm:text-6xl">
          It's a Date! ❤️
        </h1>

        {/* Description */}

        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
          You officially said yes.
          <br />
          I can't wait to spend this beautiful evening with you. 💕
        </p>

        {/* Date Card */}

        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-rose-400">
            Our Date
          </p>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-lg font-bold text-rose-900 sm:text-xl">
              📅 {formattedDate}
            </p>

            <p className="mt-3 text-lg font-semibold text-rose-700">
              🕐 {formattedTime}
            </p>
          </div>
        </div>

        {/* Romantic message */}

        <div className="mt-8 rounded-2xl bg-purple-50 px-5 py-5">
          <p className="text-base italic leading-relaxed text-slate-500">
            "One more beautiful memory for us to make together."
            <span className="ml-1">❤️</span>
          </p>
        </div>

        {/* Save button */}

        <button
          type="button"
          onClick={handleSaveDate}
          className="mt-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 font-bold text-white shadow-xl shadow-rose-300/40 transition duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
        >
          Save Our Date 💌
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Keep this little reminder of our date ❤️
        </p>

        {/* Footer */}

        <div className="mt-9 border-t border-rose-100 pt-6">
          <p className="text-sm font-semibold text-rose-400">
            See you soon, beautiful 🌹
          </p>

          <p className="mt-2 text-xs text-slate-300">
            Made with way too much love ❤️
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;