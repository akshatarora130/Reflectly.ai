'use client';

import React from 'react';
import ProductCard from './productcard';
import Navbar from '@/app/components/navbar';

const ProductGrid = () => {
  const therapists = [
    {
      name: "Ms. Nishtha Singh",
      title: "Clinical Psychologist",
      description:
        "Personalized therapy session with a licensed clinical psychologist specializing in mental health, trauma, and emotional well-being",
      image: "/therapist1.png",
      price: "₹1499",
    },
    {
      name: "Dr. Vishakha Bhalla",
      title: "Counselling Psychologist",
      description:
        "Confidential 1:1 counseling session with a certified counselor, focusing on personal challenges, emotional support, and decision-making guidance.",
      image: "/therapist2.png",
      price: "₹1599",
    },
    {
      name: "Dr. Rekha Singh",
      title: "Career Counseling",
      description:
        "1:1 session with an experienced career counselor to explore career options, job transitions, and professional growth strategies.",
      image: "/therapist3.png",
      price: "₹1800",
    },
    {
      name: "Dr. Naina",
      title: "Relationship Counseling",
      description:
        "Guided session to improve communication, resolve conflicts, and strengthen emotional bonds in romantic or family relationships.",
      image: "/therapist4.png",
      price: "₹2000",
    },
    {
      name: "Dr. Anshika",
      title: "Stress Management Counseling",
      description:
        "Personalized counseling session focused on stress management techniques, relaxation exercises, and coping strategies to deal with daily pressures.",
      image: "/therapist5.png",
      price: "₹1500",
    },
    {
      name: "Dr. Unnati",
      title: "Grief Counseling",
      description:
        "Empathetic support through a counseling session to help process loss, grief, and the emotional challenges of bereavement.",
      image: "/therapist6.png",
      price: "₹2200",
    },
  ];

  return (
    <>
      {/* Tailwind-compatible custom shimmer styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .glitter-hover {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .glitter-hover::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          border-radius: 1.5rem;
          background: linear-gradient(90deg, #014D4E, #FFF5EB, #014D4E);
          background-size: 200% auto;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          animation: shimmer 2s linear infinite;
        }
        .glitter-hover:hover::before {
          opacity: 1;
        }
        .glitter-hover > * {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <Navbar />

      <section className="bg-gradient-to-b from-[#FFF5EB] to-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-[#014D4E] mb-4 leading-tight">Book a Therapist</h1>
          <p className="text-lg text-[#2F4F4F] mb-6">
            We take a holistic, trauma-informed approach that addresses both mind and body,<br />
            guiding you toward deep healing, not just emotional release.
          </p>
          <p className="text-md text-[#2F4F4F]">
            Our psychologists receive continuous training, backed by the latest research, to help you realize your potential with strategies aligned to your values and beliefs.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {therapists.map((therapist, i) => (
            <div key={i} className="glitter-hover transform transition-transform duration-300 hover:scale-105 shadow-xl rounded-3xl">
              <ProductCard {...therapist} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductGrid;
