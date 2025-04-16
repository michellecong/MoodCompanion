import { useState, useEffect, useRef } from "react";
import "./DailyAffirmation.css";
import bg1 from "../../assets/images/affirmationBg.jpg";
import bg2 from "../../assets/images/affirmationBg2.jpg";
import bg3 from "../../assets/images/affirmationBg3.jpg";
import bg4 from "../../assets/images/affirmationBg4.jpg";
import bg5 from "../../assets/images/affirmationBg5.jpg";
import bg6 from "../../assets/images/affirmationBg6.jpg";
import bg7 from "../../assets/images/affirmationBg7.jpg";
import bg8 from "../../assets/images/affirmationBg8.jpg";
import bg9 from "../../assets/images/affirmationBg9.jpg";
import bg10 from "../../assets/images/affirmationBg10.jpg";
import bg11 from "../../assets/images/affirmationBg11.jpg";
import bg12 from "../../assets/images/affirmationBg12.jpg";

function DailyAffirmation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionClass, setTransitionClass] = useState("fade-in");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const affirmationData = [
    {
      text: "You are capable of amazing things. Today is full of possibilities.",
      background: bg1,
    },
    {
      text: "Your emotions are valid. It's okay to feel what you're feeling.",
      background: bg2,
    },
    {
      text: "Take a moment to breathe deeply and appreciate yourself today.",
      background: bg3,
    },
    {
      text: "Small steps forward are still progress. You're doing great.",
      background: bg4,
    },
    {
      text: "Your presence in this world matters. You make a difference.",
      background: bg5,
    },
    {
      text: "You are stronger than you realize, even on tough days.",
      background: bg6,
    },
    {
      text: "Every challenge you face is a chance to grow and shine.",
      background: bg7,
    },
    {
      text: "You deserve kindness—from others and from yourself.",
      background: bg8,
    },
    {
      text: "Your journey is unique, and that's what makes it beautiful.",
      background: bg9,
    },
    {
      text: "You have the power to create change, one choice at a time.",
      background: bg10,
    },
    {
      text: "It's okay to rest. You don't have to do it all today.",
      background: bg11,
    },
    {
      text: "You are enough, just as you are, right now.",
      background: bg12,
    },
  ];

  // navigate to the next or previous affirmation
  const navigate = (direction) => {
    // in case of transition, do not allow another transition
    if (isTransitioning) return;

    setIsTransitioning(true);

    // clear existing intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // set the transition class based on the direction
    setTransitionClass(
      direction === "next" ? "fade-out-left" : "fade-out-right"
    );

    // set a timeout to change the index after the transition
    timeoutRef.current = setTimeout(() => {
      if (direction === "next") {
        setCurrentIndex(
          (prevIndex) => (prevIndex + 1) % affirmationData.length
        );
      } else {
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? affirmationData.length - 1 : prevIndex - 1
        );
      }

      setTransitionClass("fade-in");

      // set a timeout to reset the transition state
      setTimeout(() => {
        setIsTransitioning(false);
        // restart autoplay
        startAutoplay();
      }, 500);
    }, 500);
  };

  // navigate to the next affirmation
  const goToNext = () => navigate("next");

  // navigate to the previous affirmation
  const goToPrev = () => navigate("prev");

  // navigate to a specific affirmation
  const goToIndex = (index) => {
    if (index === currentIndex || isTransitioning) return;

    setIsTransitioning(true);

    // clear existing intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTransitionClass(
      index > currentIndex ? "fade-out-left" : "fade-out-right"
    );

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex(index);
      setTransitionClass("fade-in");

      // set a timeout to reset the transition state
      setTimeout(() => {
        setIsTransitioning(false);
        // restart autoplay
        startAutoplay();
      }, 500);
    }, 500);
  };

  // start the autoplay feature
  const startAutoplay = () => {
    // clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // set an interval to change the affirmation every 3 seconds
    intervalRef.current = setInterval(() => {
      // if the user is currently transitioning, do not change the affirmation
      if (!isTransitioning) {
        navigate("next");
      }
    }, 3000);
  };

  // start the autoplay when the component mounts
  useEffect(() => {
    startAutoplay();

    // clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (!isTransitioning) {
      startAutoplay();
    }
  };

  return (
    <div
      className="daily-affirmation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`affirmation-image ${transitionClass}`}>
        <img
          src={affirmationData[currentIndex].background}
          alt="Inspirational background"
        />
      </div>

      <div className="carousel-controls">
        <button
          className="nav-button prev"
          onClick={goToPrev}
          aria-label="Previous affirmation"
          disabled={isTransitioning}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button
          className="nav-button next"
          onClick={goToNext}
          aria-label="Next affirmation"
          disabled={isTransitioning}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      <div className="affirmation-content">
        <h3>Today's Affirmation</h3>
        <p className={`affirmation-slide ${transitionClass}`}>
          {affirmationData[currentIndex].text}
        </p>

        <div className="carousel-indicators">
          {affirmationData.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => goToIndex(index)}
              aria-label={`Go to affirmation ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DailyAffirmation;
