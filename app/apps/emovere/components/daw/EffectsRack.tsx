import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Effect {
  id: string;
  type: "reverb" | "delay" | "filter" | "compressor";
  enabled: boolean;
  parameters: Record<string, number>;
}

interface EffectsRackProps {
  trackId: string;
  onEffectChange?: (effects: Effect[]) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({
  trackId,
  onEffectChange,
}) => {
  const [effects, setEffects] = useState<Effect[]>([
    {
      id: "reverb",
      type: "reverb",
      enabled: false,
      parameters: {
        wet: 0.5,
        dry: 0.5,
        decay: 2.5,
        roomSize: 0.8,
      },
    },
    {
      id: "delay",
      type: "delay",
      enabled: false,
      parameters: {
        time: 0.3,
        feedback: 0.3,
        wet: 0.5,
      },
    },
    {
      id: "filter",
      type: "filter",
      enabled: false,
      parameters: {
        frequency: 1000,
        Q: 1,
        type: 0, // 0: lowpass, 1: highpass, 2: bandpass
      },
    },
    {
      id: "compressor",
      type: "compressor",
      enabled: false,
      parameters: {
        threshold: -24,
        ratio: 12,
        attack: 0.003,
        release: 0.25,
      },
    },
  ]);

  const toggleEffect = useCallback(
    (effectId: string) => {
      setEffects((prev) => {
        const newEffects = prev.map((effect) =>
          effect.id === effectId
            ? { ...effect, enabled: !effect.enabled }
            : effect
        );
        onEffectChange?.(newEffects);
        return newEffects;
      });
    },
    [onEffectChange]
  );

  const updateParameter = useCallback(
    (effectId: string, param: string, value: number) => {
      setEffects((prev) => {
        const newEffects = prev.map((effect) =>
          effect.id === effectId
            ? {
                ...effect,
                parameters: {
                  ...effect.parameters,
                  [param]: value,
                },
              }
            : effect
        );
        onEffectChange?.(newEffects);
        return newEffects;
      });
    },
    [onEffectChange]
  );

  return (
    <motion.div
      className="effects-rack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="effects-grid">
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            className={`effect-unit ${effect.enabled ? "active" : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="effect-header">
              <h3>{effect.type}</h3>
              <button
                onClick={() => toggleEffect(effect.id)}
                className={`toggle-button ${effect.enabled ? "enabled" : ""}`}
              >
                {effect.enabled ? "ON" : "OFF"}
              </button>
            </div>

            {effect.enabled && (
              <div className="effect-parameters">
                {Object.entries(effect.parameters).map(([param, value]) => (
                  <div key={param} className="parameter-control">
                    <label>{param}</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={value}
                      onChange={(e) =>
                        updateParameter(
                          effect.id,
                          param,
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <span>{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
