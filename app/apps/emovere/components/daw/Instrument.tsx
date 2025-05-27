import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface Oscillator {
  type: "sine" | "square" | "sawtooth" | "triangle";
  frequency: number;
  detune: number;
  volume: number;
}

interface Envelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface InstrumentProps {
  trackId: string;
  onParameterChange?: (params: any) => void;
}

export const Instrument: React.FC<InstrumentProps> = ({
  trackId,
  onParameterChange,
}) => {
  const [oscillators, setOscillators] = useState<Oscillator[]>([
    {
      type: "sine",
      frequency: 440,
      detune: 0,
      volume: 0.5,
    },
    {
      type: "sine",
      frequency: 880,
      detune: 0,
      volume: 0.3,
    },
  ]);

  const [envelope, setEnvelope] = useState<Envelope>({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
  });

  const [filter, setFilter] = useState({
    frequency: 2000,
    Q: 1,
    type: "lowpass" as "lowpass" | "highpass" | "bandpass",
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();

      // Connect nodes
      gainNodeRef.current.connect(filterNodeRef.current);
      filterNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const updateOscillator = useCallback(
    (index: number, param: keyof Oscillator, value: any) => {
      setOscillators((prev) => {
        const newOscillators = [...prev];
        newOscillators[index] = { ...newOscillators[index], [param]: value };
        return newOscillators;
      });
    },
    []
  );

  const updateEnvelope = useCallback((param: keyof Envelope, value: number) => {
    setEnvelope((prev) => ({ ...prev, [param]: value }));
  }, []);

  const updateFilter = useCallback((param: string, value: number | string) => {
    setFilter((prev) => ({ ...prev, [param]: value }));
  }, []);

  return (
    <motion.div
      className="instrument-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="oscillators-section">
        <h3>Oscillators</h3>
        {oscillators.map((osc, index) => (
          <div key={index} className="oscillator-controls">
            <select
              value={osc.type}
              onChange={(e) => updateOscillator(index, "type", e.target.value)}
            >
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>

            <div className="parameter-control">
              <label>Frequency</label>
              <input
                type="range"
                min={20}
                max={20000}
                value={osc.frequency}
                onChange={(e) =>
                  updateOscillator(
                    index,
                    "frequency",
                    parseFloat(e.target.value)
                  )
                }
              />
              <span>{osc.frequency}Hz</span>
            </div>

            <div className="parameter-control">
              <label>Detune</label>
              <input
                type="range"
                min={-100}
                max={100}
                value={osc.detune}
                onChange={(e) =>
                  updateOscillator(index, "detune", parseFloat(e.target.value))
                }
              />
              <span>{osc.detune}cents</span>
            </div>

            <div className="parameter-control">
              <label>Volume</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={osc.volume}
                onChange={(e) =>
                  updateOscillator(index, "volume", parseFloat(e.target.value))
                }
              />
              <span>{osc.volume.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="envelope-section">
        <h3>Envelope</h3>
        {Object.entries(envelope).map(([param, value]) => (
          <div key={param} className="parameter-control">
            <label>{param}</label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={value}
              onChange={(e) =>
                updateEnvelope(
                  param as keyof Envelope,
                  parseFloat(e.target.value)
                )
              }
            />
            <span>{value.toFixed(2)}s</span>
          </div>
        ))}
      </div>

      <div className="filter-section">
        <h3>Filter</h3>
        <select
          value={filter.type}
          onChange={(e) => updateFilter("type", e.target.value)}
        >
          <option value="lowpass">Lowpass</option>
          <option value="highpass">Highpass</option>
          <option value="bandpass">Bandpass</option>
        </select>

        <div className="parameter-control">
          <label>Frequency</label>
          <input
            type="range"
            min={20}
            max={20000}
            value={filter.frequency}
            onChange={(e) =>
              updateFilter("frequency", parseFloat(e.target.value))
            }
          />
          <span>{filter.frequency}Hz</span>
        </div>

        <div className="parameter-control">
          <label>Q</label>
          <input
            type="range"
            min={0.1}
            max={20}
            step={0.1}
            value={filter.Q}
            onChange={(e) => updateFilter("Q", parseFloat(e.target.value))}
          />
          <span>{filter.Q.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
};
