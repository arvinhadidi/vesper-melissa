"use client";

import { motion } from "framer-motion";
import styles from "./landing.module.css";
import { useReveal } from "./useReveal";

type Testimonial = {
  quote: string;
  attribution: string;
};

// const ROWS: Testimonial[][] = [
//   [
//     {
//       quote:
//         "I've tried every tarot app out there. Vesper is the first one that actually feels like it's reading for me, not just giving me a textbook answer.",
//       attribution: "— Priya, 26 · London",
//     },
//     {
//       quote:
//         "Melissa remembered what I asked about last week and tied it into today's card. I actually gasped.",
//       attribution: "— Sofia, 29 · Dublin",
//     },
//     {
//       quote:
//         "The readings don't sugarcoat, but they're never cruel either. It's like advice from a friend who happens to know everything.",
//       attribution: "— Hannah, 27 · Leeds",
//     },
//     {
//       quote:
//         "I screenshot my readings and send them to my group chat almost every day. We're all obsessed.",
//       attribution: "— Jade, 22 · Bristol",
//     },
//     {
//       quote:
//         "Three days into the trial I'd already journaled more than I had all year. There was no question I was staying.",
//       attribution: "— Amara, 30 · Toronto",
//     },
//   ],
//   [
//     {
//       quote:
//         "I pull my daily card every morning before I even look at my phone. It's the one part of my day that feels like mine.",
//       attribution: "— Caitlin, 31 · New York",
//     },
//     {
//       quote:
//         "Asked about my situationship and the spread called it out so precisely I had to put my phone down for a minute.",
//       attribution: "— Lily, 24 · Birmingham",
//     },
//     {
//       quote:
//         "The journal is what got me. Scrolling back through a month of readings is like reading a diary I didn't know I was keeping.",
//       attribution: "— Noor, 28 · Chicago",
//     },
//     {
//       quote:
//         "I've had paid readings that were less thoughtful than what Melissa gives me with my coffee every morning.",
//       attribution: "— Rachel, 33 · Edinburgh",
//     },
//     {
//       quote:
//         "It never tells me what I want to hear. That's exactly why I trust it.",
//       attribution: "— Daniela, 25 · Austin",
//     },
//   ],
//   [
//     {
//       quote:
//         "I was sceptical. Then Melissa pulled The Moon for me the night I was spiralling about my ex, and the reading was so accurate I cried.",
//       attribution: "— Emilia, 24 · Manchester",
//     },
//     {
//       quote:
//         "Carrying on the conversation after a reading is the best part. I can ask the questions I'd be embarrassed to ask anyone else.",
//       attribution: "— Freya, 26 · Glasgow",
//     },
//     {
//       quote:
//         "My therapist knows about my Vesper habit and fully approves. It helps me name what I'm feeling before our sessions.",
//       attribution: "— Olivia, 32 · Seattle",
//     },
//     {
//       quote:
//         "The Tower came up the week everything fell apart at work. The reading didn't panic me — it steadied me.",
//       attribution: "— Mei, 29 · San Francisco",
//     },
//     {
//       quote:
//         "I cancelled my horoscope app. This is the only ritual I need.",
//       attribution: "— Isla, 23 · Brighton",
//     },
//   ],
// ];

const ROWS: Testimonial[][] = [
  [
    {
      quote:
        "i asked about my situationship and the reading said the thing i'd been avoiding admitting to myself for two months. had to put my phone down for a bit honestly",
      attribution: "Shannon, 24 · Liverpool",
    },
    {
      quote:
        "every other tarot app gave me one line and a 'yes/no'. this actually talks to you like a person who knows the cards. i deleted three apps the same week i found this",
      attribution: "Georgia, 29 · Melbourne",
    },
    {
      quote: "obsessed. that's it that's the review",
      attribution: "Kayla, 23 · Austin",
    },
    {
      quote: "the accuracy is scary",
      attribution: "Beth, 31 · Edinburgh",
    },
    {
      quote:
        "did the 'where is this going' spread about a guy i'd been seeing for three months. the middle card basically described the exact conversation we'd been avoiding. we had it that weekend",
      attribution: "Courtney, 25 · Sheffield",
    },
  ],
  [
    {
      quote:
        "My therapist knows about my Vesper habit and fully approves. It helps me name what I'm feeling before our sessions.",
      attribution: "Paige, 26 · Cardiff",
    },
    {
      quote:
        "i do my card before i open any other app in the morning. it's been 7 weeks. i have never stuck to anything for 7 weeks",
      attribution: "Demi, 22 · Newcastle",
    },
    {
      quote: "my new morning ritual",
      attribution: "Savannah, 26 · Denver",
    },
    {
      quote:
        "Honest without being harsh. It told me something I didn't want to hear about a friendship and it was right.",
      attribution: "Niamh, 30 · Cork",
    },
    {
      quote: "really impressive",
      attribution: "Abbie, 21 · Nottingham",
    },
  ],
  [
    {
      quote:
        "scrolled back through a month of my readings last night and realised i'd been asking the same question in different words the whole time. that did more for me than the readings themselves honestly",
      attribution: "Erin, 28 · Boston",
    },
    {
      quote:
        "genuinely better than the £40 reading i paid for last year. it doesn't tell you what you want to hear but instead what you've been ignoring",
      attribution: "Robyn, 27 · Dublin",
    },
    {
      quote: "transformed my july",
      attribution: "Jordan, 25 · Portland",
    },
    {
      quote:
        "My mum's been reading cards for thirty years and even she said the interpretations are solid. That's the highest praise that exists.",
      attribution: "Lauren, 27 · Belfast",
    },
    {
      quote:
        "drew the moon the night i was spiralling about someone and the reading named the exact fear i couldn't. i sat with it for a long time",
      attribution: "Caitlin, 29 · Glasgow",
    },
  ],
];

function TestimonialCard({ quote, attribution }: Testimonial) {
  return (
    <figure className={styles.testimonialCard}>
      <span className={styles.testimonialQuotemark} aria-hidden="true">
        &ldquo;
      </span>
      <blockquote className={styles.testimonialQuote}>{quote}</blockquote>
      <figcaption className={styles.testimonialAttr}>{attribution}</figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reveal = useReveal();

  return (
    <section className={styles.testimonials}>
      <motion.div className={styles.testimonialsHeading} {...reveal()}>
        <span className={styles.eyebrow}>Highly rated</span>
        <h2 className={styles.sectionHeading}>You&rsquo;re in good company</h2>
      </motion.div>
      <div className={styles.marqueeRows}>
        {ROWS.map((row, rowIndex) => (
          <div className={styles.marquee} key={rowIndex}>
            <div
              className={`${styles.marqueeTrack} ${
                rowIndex % 2 === 1 ? styles.marqueeTrackReverse : ""
              }`}
            >
              {row.map((testimonial) => (
                <TestimonialCard key={testimonial.attribution} {...testimonial} />
              ))}
              {/* Second copy makes the loop seamless; hidden from AT. */}
              <div className={styles.marqueeClone} aria-hidden="true">
                {row.map((testimonial) => (
                  <TestimonialCard
                    key={`${testimonial.attribution}-clone`}
                    {...testimonial}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
