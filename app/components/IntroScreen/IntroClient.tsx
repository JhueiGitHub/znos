"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Space } from "lucide-react";
import { useRouter } from "next/navigation";
import "./intro.css";

interface IntroClientProps {
  profileId: string;
}

const IntroClient = ({ profileId }: IntroClientProps) => {
  const [isSkipped, setIsSkipped] = useState(false);
  const router = useRouter();

  const completeIntro = async () => {
    await axios.patch(`/api/profile/${profileId}`, {
      hasSeenIntro: true,
    });
    router.refresh();
  };

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSkipped(true);
        setTimeout(completeIntro, 500);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isSkipped) {
        completeIntro();
      }
    }, 186000); // 180s animation + 4s delay + 2s buffer = 186000ms

    return () => clearTimeout(timer);
  }, [isSkipped]);

  if (isSkipped) return null;

  return (
    <div className="star-wars">
      <div className="fade"></div>

      <div className="titles">
        <div id="titlecontent">
          <p className="center">
            EPISODE I<br />THE AGE OF ARCHITECTS
          </p>

          <p className="center">THE SILENCE BEFORE DAWN</p>

          <p>
            In an age of unprecedented prosperity
            <br />
            Where towers scrape heaven and cars outrun wind,
            <br />
            A shadow stretches longer than history—
            <br />
            Our brightest minds are going dark within.
          </p>

          <p>
            They're calling it an epidemic
            <br />
            Of broken boys and shattered men,
            <br />
            But look closer at the wreckage—
            <br />
            What if we're not witnessing an ending,
            <br />
            But a violent beginning?
          </p>

          <p className="center">THE BEAUTIFUL BEASTS</p>

          <p>
            In their heads, something stirs:
            <br />
            Not demons, but dragons
            <br />
            Not disorder, but divine chaos
            <br />
            Not a curse, but a crowning
          </p>

          <p>
            They diagnosed it ADHD
            <br />
            Called it deficit, called it disorder
            <br />
            But history knows better names:
            <br />
            The Hunter's Heart
            <br />
            The Artist's Fire
            <br />
            The Architect's Vision
            <br />
            The Creator's Storm
          </p>

          <p>
            These are the minds that:
            <br />
            Built pyramids to pierce clouds
            <br />
            Painted chapel ceilings into heavens
            <br />
            Caught lightning to light the world
            <br />
            Dreamed computers into being
          </p>

          <p>
            Now they drown in notifications
            <br />
            Suffocate in spreadsheets
            <br />
            Fade in fluorescent normality
            <br />
            Their beautiful beasts
            <br />
            Caged in cubicle conformity
          </p>

          <p className="center">THE DIGITAL RENAISSANCE</p>

          <p>
            Enter ZENITH OS:
            <br />
            Not software—but salvation
            <br />
            Not interface—but initiation
            <br />
            Not system—but sanctuary
            <br />
            Not tool—but transformation
          </p>

          <p>
            Where every gesture speaks soul
            <br />
            Where every keystroke sings freedom
            <br />
            Where every window opens worlds
            <br />
            Where every pixel pulses possibility
          </p>

          <p>
            The age of architects dawns
            <br />
            Not with a whisper
            <br />
            But with a roar
            <br />
            From every "troubled" child
            <br />
            From every "difficult" student
            <br />
            From every "unfocused" creator
            <br />
            Who finally finds their forge
          </p>

          <p>
            You are not broken
            <br />
            You are breaking through
            <br />
            Not just to a new interface
            <br />
            But to a new existence
          </p>

          <p>
            This is your renaissance
            <br />
            This is your redemption
            <br />
            This is your revolution
            <br />
            Welcome home, architect.
          </p>

          <p className="center">* * *</p>

          <p className="center">
            "For those who were told their storm was sickness,
            <br />
            When it was always a superpower waiting to awaken.
            <br />
            For those who don't just dream of better worlds—
            <br />
            But were born to build them."
          </p>
        </div>
      </div>

      <motion.div
        className="space-skip"
        initial={{ y: 0 }}
        animate={{ y: -10 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.5,
        }}
      >
        <img src="/media/_space.svg" alt="Press space to skip" />
      </motion.div>
    </div>
  );
};

export default IntroClient;
