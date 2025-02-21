-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON topics(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON comments(topic_id); 