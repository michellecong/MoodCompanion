import { useState, useEffect, useRef } from "react";
import "./DailyAffirmation.css";

// 导入多张背景图片 - 实际使用时替换为你的图片路径
import bg1 from "../../assets/images/affirmationBg.jpg";
// 以下路径需要根据你的实际项目结构调整
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

  // 预定义肯定语列表
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

  // 导航到特定方向的函数
  const navigate = (direction) => {
    // 防止多次转换同时进行
    if (isTransitioning) return;

    setIsTransitioning(true);

    // 清除现有计时器以避免冲突
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 根据方向设置过渡类
    setTransitionClass(
      direction === "next" ? "fade-out-left" : "fade-out-right"
    );

    // 动画完成后，更改内容
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

      // 淡入动画后，重置过渡状态
      setTimeout(() => {
        setIsTransitioning(false);
        // 重启自动播放
        startAutoplay();
      }, 500);
    }, 500);
  };

  // 导航到下一个肯定语的函数
  const goToNext = () => navigate("next");

  // 导航到上一个肯定语的函数
  const goToPrev = () => navigate("prev");

  // 导航到特定索引的函数
  const goToIndex = (index) => {
    if (index === currentIndex || isTransitioning) return;

    setIsTransitioning(true);

    // 清除现有计时器
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

      // 淡入动画后，重置过渡状态
      setTimeout(() => {
        setIsTransitioning(false);
        // 重启自动播放
        startAutoplay();
      }, 500);
    }, 500);
  };

  // 开始自动播放函数
  const startAutoplay = () => {
    // 首先清除现有间隔
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 设置新间隔
    intervalRef.current = setInterval(() => {
      // 仅在未处于过渡状态时更改
      if (!isTransitioning) {
        navigate("next");
      }
    }, 3000);
  };

  // 组件挂载时初始化自动播放
  useEffect(() => {
    startAutoplay();

    // 卸载时清除所有计时器
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 处理键盘导航
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

  // 鼠标悬停时暂停自动播放
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // 仅在未处于过渡状态时重启
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
