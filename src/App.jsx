import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Project from './components/Project';
import Contact from './components/Contact';
function App() {
  return (
    <>
      <Navbar />
      <Home />
      <About/>
      <Skills />
      <Project />
      <Contact />
    </>
  );
}

export default App;