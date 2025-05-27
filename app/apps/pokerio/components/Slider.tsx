import React, { useState, useEffect } from "react";

interface SliderProps {
    defualtValue: number;
    min: number;
    max: number;
    addon: number;
    onValue: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ defualtValue, min, max, addon, onValue }) => {
    const [value, setValue] = useState(defualtValue);

    useEffect(() => {
        setValue(defualtValue);
    }, [defualtValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        setValue(newValue);
        onValue(newValue);
    };

    return (
        <div className="slider">
            <span>{min + addon}</span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
            />
            <span>{value + addon}</span>
            <span>{max + addon}</span>
        </div>
    );
};

export default Slider;
