import React, { useState, useEffect } from 'react';
import startIcon from '../start-icon.png';

const debugMode = window.location.href === "http://localhost:5173/";
const workInterval = debugMode ? 6 : 25 * 60;
const breakInterval = debugMode ? 3 : 5 * 60;

const PomodoroTimer = () => {
  const [time, setTime] = useState(-workInterval);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check for notification permissions on mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === "granted");
      });
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
      // TODO: set an 'original time' and set the timeout to the
      // amount of time until the next second, (not always 1000)
      // Over a long running timer, the current logic will drift
    }
    if (time === 0) {
      notifyUser();
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const plus = seconds > 0 ? "+" : "";
    seconds = seconds > 0 ? seconds : -seconds;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${plus}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const notifyUser = () => {
    
    if (notificationsEnabled) {
      if (notification) {
        notification.close();
      }

      const newNotification = new Notification(
        isWorkTime ? "Work Time Complete!" : "Break Time Complete!", 
        {
          body: isWorkTime ? 
            "Click here to start your break" : 
            "Click here to start working",
          tag: 'main-action',
          icon: startIcon,
        }
      );

      // if user clicks the notification, bring them to the tab, reset timer (?)
      newNotification.onclick = () => {
        if (debugMode) console.log("onclick called");
        switchMode();
        setIsRunning(false);
        newNotification.close();
        window.focus();
      };

      // if user clicks "x" to close notification, let them continue
      newNotification.onclose = () => {
        if (debugMode) console.log("onclose called");
        newNotification.close();
      };

      // TODO: add and then remove event listener when needed
      // would like to clear out stale notifications, and need to remove event listeners
      // document.addEventListener("visibilitychange", () => {
      //   if (document.visibilityState === "visible" && newNotification) {
      //     // The tab has become visible so clear the now-stale Notification.
      //     n.close();
      //   }
      // });

      setNotification(newNotification);
    }
  };

  const switchMode = () => {
    setIsWorkTime(prev => !prev);
    setTime(isWorkTime ? -breakInterval : -workInterval);
  };

  // ↺
  const handleReset = () => {
    // we always go to work mode when resetting ???
    setIsWorkTime(true);
    setTime(-workInterval);
    setIsRunning(false);
    notification.close();
  }
  
  // ▶
  const handlePlay = () => {
    setIsRunning(!isRunning);
  }

  // ⏭
  const handleSkip = () => {
    switchMode();
    setIsRunning(false);
    newNotification.close();
    window.focus();
  }

  return (
      <div className="text-slate-600">
        <div className="flex gap-4">

          {/* Timer Display */}
          <span className="text-5xl font-mono font-bold">
            {formatTime(time)}
          </span>

          {/* Controls */}
          <span className="flex gap-2">
            {/* Reset button */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
              onClick={handleReset}
            >
              ↺
            </button>

            {/* Play button */}
            {(!isRunning) &&
            <button
              className={`px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white`}
              onClick={handlePlay}
            >
              ▶
            </button>
            }

            {/* Skip button */}
            {(isRunning && time > 0) &&
            <button
              className={`px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white`}
              onClick={handleSkip}
            >
              ⏭
            </button>
            }
          </span>
        </div>
        {debugMode && (
          <div>
            <div>time: {time}</div>
            <div>isRunning: {isRunning.toString()}</div>
            <div>isWorkTime: {isWorkTime.toString()}</div>
            <div>notificationsEnabled: {notificationsEnabled.toString()}</div>
          </div>
        )}
      </div>
  );
};

export default PomodoroTimer;