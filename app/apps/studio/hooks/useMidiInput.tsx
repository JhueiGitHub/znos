// app/apps/studio/hooks/useMidiInput.ts
import { useState, useEffect, useCallback } from "react";

// Our hook interface
interface MidiNote {
  note: number;
  velocity: number;
}

interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

interface MidiInputHook {
  midiEnabled: boolean;
  midiNotes: MidiNote[];
  midiDevices: MidiDevice[];
  selectedDeviceId: string | null;
  selectDevice: (deviceId: string) => void;
}

export const useMidiInput = (): MidiInputHook => {
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [midiNotes, setMidiNotes] = useState<MidiNote[]>([]);
  const [midiDevices, setMidiDevices] = useState<MidiDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Request MIDI access
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) {
      return;
    }

    navigator
      .requestMIDIAccess()
      .then((access) => {
        // Use type assertion to avoid conflicts with DOM types
        setMidiAccess(access as any);
        setMidiEnabled(true);

        // Listen for device changes
        access.onstatechange = () => {
          updateDeviceList(access as any);
        };

        // Initial device list
        updateDeviceList(access as any);
      })
      .catch((err) => {
        console.warn("MIDI access denied:", err);
        setMidiEnabled(false);
      });
  }, []);

  // Update the device list
  const updateDeviceList = useCallback(
    (access: any) => {
      const devices: MidiDevice[] = [];

      // Add input devices
      access.inputs.forEach((input: any) => {
        devices.push({
          id: input.id,
          name: input.name || "Unknown Device",
          manufacturer: input.manufacturer || "Unknown Manufacturer",
        });
      });

      setMidiDevices(devices);

      // If no device is selected and devices are available, select the first one
      if (!selectedDeviceId && devices.length > 0) {
        selectDevice(devices[0].id);
      }
    },
    [selectedDeviceId]
  );

  // Handle MIDI message
  const handleMidiMessage = useCallback((message: any) => {
    const data = message.data;
    const command = data[0];
    const note = data[1];
    const velocity = data[2];

    // Note on (144) with velocity > 0
    if (command === 144 && velocity > 0) {
      setMidiNotes((prevNotes) => [
        ...prevNotes.filter((n) => n.note !== note),
        { note, velocity },
      ]);
    }
    // Note off (128) or note on with velocity 0
    else if (command === 128 || (command === 144 && velocity === 0)) {
      setMidiNotes((prevNotes) => prevNotes.filter((n) => n.note !== note));
    }
  }, []);

  // Select MIDI device
  const selectDevice = useCallback(
    (deviceId: string) => {
      if (!midiAccess) return;

      // Disconnect previous device
      midiAccess.inputs.forEach((input: any) => {
        input.onmidimessage = null;
      });

      // Connect new device
      const input = midiAccess.inputs.get(deviceId);
      if (input) {
        input.onmidimessage = handleMidiMessage;
        setSelectedDeviceId(deviceId);
      }
    },
    [midiAccess, handleMidiMessage]
  );

  return {
    midiEnabled,
    midiNotes,
    midiDevices,
    selectedDeviceId,
    selectDevice,
  };
};
