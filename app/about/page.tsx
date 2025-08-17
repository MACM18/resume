"use client";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Code, Palette, Zap, Heart } from "lucide-react";
import { aboutPageData } from "@/data/portfolio";

const iconMap = {
  Code,
  Palette,
  Zap,
  Heart,
};

const About = () => {
  return (
    <div className='min-h-screen relative pt-24 pb-12 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            {aboutPageData.title}
          </h1>
          <p className='text-xl text-foreground/80 max-w-2xl mx-auto'>
            {aboutPageData.subtitle}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className='space-y-12'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className='p-8'>
              <h2 className='text-3xl font-bold mb-6 text-primary'>My Story</h2>
              <div className='space-y-4 text-foreground/80 leading-relaxed'>
                {aboutPageData.story.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className='text-3xl font-bold mb-8 text-center text-secondary'>
              Skills & Expertise
            </h2>
            <div className='grid md:grid-cols-2 gap-6'>
              {aboutPageData.skills.map((skillGroup, index) => {
                const Icon = iconMap[skillGroup.icon as keyof typeof iconMap];
                return (
                  <motion.div
                    key={skillGroup.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <GlassCard className='p-6' hover>
                      <div className='flex items-center mb-4'>
                        <Icon className='text-primary mr-3' size={24} />
                        <h3 className='text-xl font-semibold'>
                          {skillGroup.category}
                        </h3>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {skillGroup.items.map((skill) => (
                          <span
                            key={skill}
                            className='px-3 py-1 text-sm rounded-full bg-glass-bg/20 border border-glass-border/30 text-foreground/80'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='text-center'
          >
            <GlassCard className='p-8'>
              <h2 className='text-2xl font-bold mb-4 text-accent'>
                {aboutPageData.callToAction.title}
              </h2>
              <p className='text-foreground/80 mb-6 max-w-2xl mx-auto'>
                {aboutPageData.callToAction.description}
              </p>
              <a
                href={`mailto:${aboutPageData.callToAction.email}`}
                className='inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:shadow-glow'
              >
                Get In Touch
              </a>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
