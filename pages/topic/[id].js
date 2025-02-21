import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Navbar from '../../components/Navbar';

const TopicDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        author:profiles(username)
      `)
      .eq('id', id)
      .single();
    if (!error) {
      setTopic(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(username)
      `)
      .eq('topic_id', id)
      .order('created_at', { ascending: true });
    if (!error) {
      setComments(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTopic();
      fetchComments();

      // Set up real-time subscription for comments
      const channel = supabase
        .channel(`public:comments:${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `topic_id=eq.${id}`,
          },
          (payload) => {
            // Handle different events
            switch (payload.eventType) {
              case 'INSERT':
                setComments(current => [...current, payload.new]);
                break;
              case 'DELETE':
                setComments(current => 
                  current.filter(comment => comment.id !== payload.old.id)
                );
                break;
              case 'UPDATE':
                setComments(current => 
                  current.map(comment => 
                    comment.id === payload.new.id ? payload.new : comment
                  )
                );
                break;
            }
          }
        )
        .subscribe();

      // Set up real-time subscription for topics
      const topicChannel = supabase
        .channel(`public:topics:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'topics',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            setTopic(payload.new);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
        topicChannel.unsubscribe();
      };
    }
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    
    const { error } = await supabase
      .from('comments')
      .insert([
        {
          topic_id: id,
          content: newComment,
          author_id: user.id
        }
      ]);
    if (!error) {
      setNewComment("");
    } else {
      alert(error.message);
    }
  };

  const markAsDone = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert("Please log in first");
        return;
      }

      if (!topic) {
        alert("Topic not found");
        return;
      }

      if (user.id !== topic.author_id) {
        alert("Only the creator can mark as done.");
        return;
      }

      // First update
      const { error: updateError } = await supabase
        .from('topics')
        .update({ status: 'done' })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating topic:', updateError);
        alert(`Failed to update topic: ${updateError.message}`);
        return;
      }

      // Then fetch the updated topic
      const { data: updatedTopic, error: fetchError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated topic:', fetchError);
        return;
      }

      if (updatedTopic) {
        setTopic(updatedTopic);
      }
    } catch (error) {
      console.error('Error marking topic as done:', error);
      alert('Failed to update topic status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="newspaper-container">
        {topic ? (
          <article className="max-w-4xl mx-auto px-4">
            <header className="mb-6 md:mb-8 border-b-2 border-gray-700 pb-4 md:pb-6">
              <h1 className="newspaper-headline mb-3 md:mb-4">{topic.title}</h1>
              <div className="newspaper-meta border-none">
                By {topic.author?.username || 'Anonymous'} • 
                <span className={`ml-2 ${
                  topic.status === 'open' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {topic.status === 'open' ? 'Ongoing Discussion' : 'Discussion Concluded'}
                </span>
              </div>
            </header>

            <div className="font-serif text-lg leading-relaxed mb-8">
              <p>{topic.description}</p>
            </div>

            {topic.meeting_link && (
              <div className="mb-8 p-4 bg-gray-800 border border-gray-700">
                <h3 className="font-serif font-semibold mb-2 text-gray-200">Meeting Information</h3>
                <a
                  href={topic.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  Join Virtual Meeting →
                </a>
              </div>
            )}

            {topic.status === 'open' && (
              <button
                onClick={markAsDone}
                className="newspaper-button mb-12"
              >
                Mark Discussion as Concluded
              </button>
            )}

            <section className="mt-12 border-t-2 border-black pt-8">
              <h2 className="newspaper-subheading mb-6">Discussion Comments</h2>
              
              <form onSubmit={handleCommentSubmit} className="mb-6 md:mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add to the discussion..."
                  className="newspaper-input mb-3 md:mb-4"
                  rows="3"
                ></textarea>
                <button type="submit" className="newspaper-button w-full md:w-auto">
                  Post Comment
                </button>
              </form>

              <div className="space-y-8">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-700 pb-6">
                    <p className="font-serif text-gray-200 mb-3">{comment.content}</p>
                    <p className="text-sm text-gray-400">
                      Comment by {comment.author?.username || 'Anonymous'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
