-- Add slugs to existing blog posts
-- This script generates SEO-friendly slugs for posts that don't have them

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing posts with slugs if they don't have them
UPDATE blog_posts 
SET slug = generate_slug(title)
WHERE slug IS NULL OR slug = '';

-- Handle duplicate slugs by adding numbers
WITH ranked_posts AS (
  SELECT 
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM blog_posts 
  WHERE slug IS NOT NULL
)
UPDATE blog_posts 
SET slug = CASE 
  WHEN ranked_posts.rn = 1 THEN ranked_posts.slug
  ELSE ranked_posts.slug || '-' || ranked_posts.rn
END
FROM ranked_posts
WHERE blog_posts.id = ranked_posts.id
  AND ranked_posts.rn > 1;

-- Create example blog post with proper slug
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category,
  tags,
  status,
  author_id,
  published_at
) VALUES (
  'Tips and Tricks: Learning New Languages Faster',
  'tips-and-tricks-learning-new-languages-faster',
  'Discover proven strategies and techniques to accelerate your language learning journey and achieve fluency faster than you thought possible.',
  '# Tips and Tricks: Learning New Languages Faster

Learning a new language can be one of the most rewarding experiences, but it can also feel overwhelming. Whether you''re picking up Spanish for your next vacation, learning Mandarin for business, or diving into French for personal enrichment, the key is having the right strategies.

## 1. Immerse Yourself Daily

The most effective language learners don''t just study—they immerse themselves in the language every single day. This doesn''t mean you need to move to another country. Here''s how to create immersion at home:

- **Change your phone''s language settings** to your target language
- **Watch Netflix with subtitles** in your target language  
- **Listen to podcasts** during commutes
- **Follow social media accounts** in your target language

## 2. Focus on High-Frequency Words

Instead of trying to memorize every word in the dictionary, focus on the most commonly used words. Studies show that just 1,000 words make up about 80% of everyday conversation.

Start with these categories:
- Numbers (1-100)
- Days, months, seasons
- Common verbs (be, have, do, go, come, etc.)
- Question words (what, where, when, why, how)
- Basic adjectives (good, bad, big, small, etc.)

## 3. Practice Speaking from Day One

Many language learners spend months studying grammar and vocabulary before they ever speak a word. This is a mistake! Start speaking from day one, even if it''s just reading aloud or talking to yourself.

**Practical speaking tips:**
- Use language exchange apps like HelloTalk or Tandem
- Practice with AI chatbots designed for language learning
- Record yourself speaking and listen back
- Join online conversation groups or local meetups

## 4. Use the Spaced Repetition System (SRS)

Your brain naturally forgets information over time, but spaced repetition helps combat this by reviewing information at optimal intervals.

**Popular SRS tools:**
- **Anki** - Highly customizable flashcard app
- **Memrise** - Gamified vocabulary learning
- **Quizlet** - User-friendly with tons of pre-made decks

## 5. Learn Grammar in Context

Don''t memorize grammar rules in isolation. Instead, learn them through examples and real conversations. When you encounter a new grammar pattern, try to use it in three different sentences immediately.

## 6. Set Specific, Measurable Goals

Instead of saying "I want to learn Spanish," set specific goals like:
- "I will learn 20 new vocabulary words this week"
- "I will have a 10-minute conversation with a native speaker by the end of the month"
- "I will read one news article in Spanish every day"

## 7. Make Mistakes (and Learn from Them)

Perfect is the enemy of good when it comes to language learning. Don''t be afraid to make mistakes—they''re actually essential for learning. Every mistake is valuable feedback that helps your brain understand the patterns of the language.

## 8. Use Multiple Learning Methods

Different people learn in different ways, so use a combination of methods:
- **Visual learners**: Use flashcards with images, watch videos
- **Auditory learners**: Focus on listening exercises, music, podcasts  
- **Kinesthetic learners**: Write words by hand, use gestures while speaking

## 9. Connect with the Culture

Language and culture are inseparable. The more you understand the culture behind a language, the better you''ll understand why certain phrases are used and when.

- Watch movies and TV shows from that culture
- Learn about holidays and traditions
- Try cooking traditional foods
- Read about the history and current events

## 10. Track Your Progress

Keep a language learning journal where you record:
- New words learned each day
- Conversations you had
- Mistakes you made and learned from
- Cultural insights you gained

Seeing your progress over time will keep you motivated during challenging periods.

## Conclusion

Learning a new language is a marathon, not a sprint. The key is consistency, not perfection. By implementing these strategies and making language learning a daily habit, you''ll be amazed at how quickly you progress.

Remember: every polyglot started as a beginner. The difference between those who become fluent and those who give up isn''t talent—it''s persistence and the right strategies.

**Start today with just 15 minutes of focused practice. Your future multilingual self will thank you!**',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'Education',
  ARRAY['language learning', 'education', 'tips', 'study techniques'],
  'published',
  (SELECT user_id FROM profiles WHERE username = 'nanopro' LIMIT 1),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Clean up the helper function
DROP FUNCTION generate_slug(TEXT);

-- Verify the results
SELECT id, title, slug, status FROM blog_posts ORDER BY created_at DESC LIMIT 5;
