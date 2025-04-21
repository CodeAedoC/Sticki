import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <h1>About Sticki</h1>
      <p>
        Sticki is a collaborative whiteboard application designed to facilitate real-time drawing and brainstorming sessions. It allows users to create and join rooms, share ideas, and communicate effectively through an integrated chat feature.
      </p>
      <h2>Technologies Used</h2>
      <ul>
        <li>React</li>
        <li>Supabase for authentication and data storage</li>
        <li>Liveblocks for real-time collaboration</li>
        <li>CSS for styling</li>
      </ul>
      <h2>Developer</h2>
      <p>
        Developed by Jatin Mangtani.
      </p>
    </div>
  );
};

export default About;