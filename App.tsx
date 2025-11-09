import { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Play, Pause, RotateCcw, Coffee, Briefcase } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak';

const TIMER_SETTINGS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
};

export default function App() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const totalTime = TIMER_SETTINGS[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'shortBreak') {
        playBackToWorkBGM();
      } else {
        playNotification();
      }
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = () => {
    if (mode === 'work') {
      setSessions(sessions + 1);
      switchMode('shortBreak');
    } else {
      switchMode('work');
    }
  };

  const playNotification = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 作業終了＝休憩開始なので、リラックスを促す穏やかな下降音
    const melody = [
      { note: 880.00, duration: 0.4 }, // A5
      { note: 783.99, duration: 0.4 }, // G5
      { note: 659.25, duration: 0.4 }, // E5
      { note: 523.25, duration: 0.6 }, // C5
    ];

    let currentTime = audioContext.currentTime;

    // 2回繰り返す
    for (let repeat = 0; repeat < 2; repeat++) {
      melody.forEach((tone) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = tone.note;
        oscillator.type = 'sine';

        // エンベロープ（音の立ち上がりと減衰）
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + tone.duration);

        currentTime += tone.duration;
      });
      currentTime += 0.15;
    }
  };

  const playBackToWorkBGM = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const tempo = 140;
    const beatDuration = 60 / tempo;

    // 明るく元気なメロディー（ドレミファソラシド）
    const melody = [
      { note: 523.25, duration: 0.3 }, // C5
      { note: 587.33, duration: 0.3 }, // D5
      { note: 659.25, duration: 0.3 }, // E5
      { note: 698.46, duration: 0.2 }, // F5
      { note: 783.99, duration: 0.4 }, // G5
      { note: 783.99, duration: 0.3 }, // G5
      { note: 880.00, duration: 0.5 }, // A5
      { note: 783.99, duration: 0.3 }, // G5
      { note: 659.25, duration: 0.3 }, // E5
      { note: 523.25, duration: 0.6 }, // C5
    ];

    let currentTime = audioContext.currentTime;

    // メロディーを3回繰り返す
    for (let repeat = 0; repeat < 3; repeat++) {
      melody.forEach((tone) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = tone.note;
        oscillator.type = 'sine';

        // エンベロープ（音の立ち上がりと減衰）
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + tone.duration);

        currentTime += tone.duration;
      });
      // 各繰り返しの間に少し間隔を空ける
      currentTime += 0.2;
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_SETTINGS[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    return mode === 'work' ? '作業時間' : '休憩';
  };

  const getModeColor = () => {
    return mode === 'work' ? 'bg-indigo-600' : 'bg-teal-500';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
      mode === 'work' ? 'bg-indigo-50' : 'bg-teal-50'
    }`}>
      <div className="w-full max-w-md px-4">
        <Card className="p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Mode Badges */}
            <div className="flex justify-center gap-2">
              <Badge
                variant={mode === 'work' ? 'default' : 'outline'}
                className={`cursor-pointer ${mode === 'work' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                onClick={() => switchMode('work')}
              >
                <Briefcase className="w-3 h-3 mr-1" />
                作業
              </Badge>
              <Badge
                variant={mode === 'shortBreak' ? 'default' : 'outline'}
                className={`cursor-pointer ${mode === 'shortBreak' ? 'bg-teal-500 hover:bg-teal-600' : ''}`}
                onClick={() => switchMode('shortBreak')}
              >
                <Coffee className="w-3 h-3 mr-1" />
                休憩
              </Badge>
            </div>

            {/* Current Mode */}
            <div>
              <h2 className="text-gray-600 mb-2">{getModeLabel()}</h2>
            </div>

            {/* Timer Display */}
            <div className="relative">
              <div className={`text-8xl tabular-nums ${
                mode === 'work' ? 'text-indigo-600' : 'text-teal-500'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className={`w-32 ${getModeColor()} hover:opacity-90`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    一時停止
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    開始
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                リセット
              </Button>
            </div>

            {/* Session Counter */}
            <div className="pt-4 border-t">
              <p className="text-gray-600">完了セッション数</p>
              <p className="text-3xl mt-1">{sessions}</p>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>💡 ヒント: 作業に集中して、休憩を忘れずに！</p>
        </div>
      </div>
    </div>
  );
}
