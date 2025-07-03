import React, { useState, useEffect } from 'react';
import './Game.css';

const Game = () => {
    const [points, setPoints] = useState(5);
    const [circles, setCircles] = useState([]);
    const [current, setCurrent] = useState(1);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);
    const [status, setStatus] = useState("LET'S PLAY");
    const [hasStarted, setHasStarted] = useState(false);
    //Kích hoạt tự động click khi chế độ Auto Play được bật (useEffect)
    useEffect(() => { 
        if (autoPlay && isPlaying) {
            if (current <= points) {
                const timer = setTimeout(() => {
                    handleClick(current);
                }, 2500);

                return () => clearTimeout(timer);  // Xóa bộ đếm khi không còn cần thiết (tắt chế độ Auto Play)
            }
        }
    }, [autoPlay, isPlaying, current]);
    //Tăng thời gian theo đơn vị 0.1 giây khi đang chơi (useEffect)
    useEffect(() => {
        if (isPlaying) {
            const timer = setInterval(() => {
                setElapsedTime(prev => parseFloat((prev + 0.1).toFixed(1)));
            }, 100);

            return () => clearInterval(timer); // Xóa bộ đếm khi kết thúc trò chơi
        }
    }, [isPlaying]);
// Lấy vị trí ngẫu nhiên cho các ô tròn
    const getRandomPosition = () => {
        const areaSize = 600;
        const circleSize = 50;
        const maxPos = areaSize - circleSize;

        const x = Math.floor(Math.random() * maxPos);
        const y = Math.floor(Math.random() * maxPos);

        return { x, y };
    };
// Khởi tạo trò chơi
    const initializeGame = () => {
        const newCircles = Array.from({ length: points }, (_, index) => {
            const { x, y } = getRandomPosition();
            return {
                number: index + 1,
                visible: true, // Tắt các ô tròn
                time: 2.5, // Thời gian hiển thị số trên mỗi ô tròn
                clicked: false, // Trạng thái đã nhấn vào ô tròn
                fadeOut: false, // Trạng thái mờ dần
                position: { x, y }, // Vị trí của ô tròn
                showTime: false // Hiển thị thời gian trên ô tròn
            };
        });

        setCircles(newCircles);
        setCurrent(1);
        setElapsedTime(0);
        setIsPlaying(false);
        setAutoPlay(false);
        setStatus("LET'S PLAY");
    };
// Bắt đầu trò chơi
    const startGame = () => {
        setHasStarted(true);
        initializeGame();
    };
//chơi lại trò chơi
    const restartGame = () => {
        initializeGame();
    };

    const handleClick = (number) => {
        if (status === "GAME OVER" || status === "ALL CLEARED") return;

        if (!isPlaying) setIsPlaying(true);

        if (number === current) {
            const index = circles.findIndex(circle => circle.number === number);
            const newCircles = [...circles];

            if (index !== -1) {
                newCircles[index].time = 2.5;
                newCircles[index].clicked = true;
                newCircles[index].showTime = true;

                const interval = setInterval(() => {
                    newCircles[index].time -= 0.1;

                    if (newCircles[index].time <= 0) {
                        newCircles[index].visible = false;
                        clearInterval(interval);

                        if (number === points) {
                            setIsPlaying(false);
                            setStatus("ALL CLEARED");
                        }
                    }

                    setCircles([...newCircles]);
                }, 100);

                // Tạo hiệu ứng mờ dần khi nhấn đúng số
                setTimeout(() => {
                    newCircles[index].fadeOut = true;
                    setCircles([...newCircles]);
                }, 200);
            }

            setCurrent(current + 1);
        } else {
            setStatus("GAME OVER");
            setIsPlaying(false);
            setAutoPlay(false);
        }
    };

    return (
        <div className="game-container">
            <div className="control-panel">
            <h1 className={status === "ALL CLEARED" ? "status-success" : status === "GAME OVER" ? "status-fail" : ""}>{status}</h1>
                <div>
                    Points: 
                    <input 
                        type="number" 
                        value={points} 
                        onChange={(e) => {
                            const val = e.target.value.replace(/^0+/, ''); // loại bỏ số 0 đầu
                            if (val === '' || Number(val) < 1) {
                                setPoints(1);
                            } else {
                                setPoints(Number(val));
                            }
                        }} 
                        min="1"
                    />
                </div>
                <div>Time: {elapsedTime.toFixed(1)}s</div>

                {!hasStarted ? (
                    <button onClick={startGame}>Play</button>
                ) : (
                    <>
                        <button onClick={restartGame}>Restart</button>
                        <button onClick={() => setAutoPlay(!autoPlay)}>
                            Auto Play {autoPlay ? 'ON' : 'OFF'}
                        </button>
                    </>
                )}
            </div>

            <div className="game-area">
                {hasStarted && circles.map(circle => (
                    circle.visible && (
                        <div 
                            key={circle.number}
                            className={`circle ${circle.clicked ? 'clicked' : ''} ${circle.number === current ? 'active' : ''}`}
                            onClick={() => handleClick(circle.number)}
                            style={{ 
                                left: `${circle.position.x}px`, 
                                top: `${circle.position.y}px`,
                                opacity: circle.fadeOut ? 0 : 1,
                                transition: 'opacity 2.5s',
                                zIndex: points - circle.number
                            }}
                        >
                            <div className="number">{circle.number}</div>
                            {circle.showTime && (
                                <div className="timer">{circle.time.toFixed(1)}</div>
                            )}
                        </div>
                    )
                ))}
            </div>

            {hasStarted && <div className="next-number">Next: {current}</div>}
        </div>
    );
};

export default Game;
