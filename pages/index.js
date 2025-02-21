import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");

  const fetchTopics = async () => {
    try {
      let query = supabase
        .from('topics')
        .select(`
          id,
          title,
          description,
          status,
          meeting_link,
          created_at,
          author:profiles(username)
        `)
        .order('created_at', { ascending: false })
        .limit(20); // Add pagination to improve performance
      
      if (filter !== "all") {
        query = query.eq('status', filter);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching topics:', error);
        return;
      }
      setTopics(data || []);
    } catch (error) {
      console.error('Error in fetchTopics:', error);
    }
  };

  useEffect(() => {
    fetchTopics();

    // Set up real-time subscription for topics
    const channel = supabase
      .channel('public:topics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topics',
        },
        async (payload) => {
          // Handle different events
          switch (payload.eventType) {
            case 'INSERT':
              if (filter === 'all' || payload.new.status === filter) {
                // Fetch the complete topic with author info
                const { data } = await supabase
                  .from('topics')
                  .select('*, author:profiles(username)')
                  .eq('id', payload.new.id)
                  .single();
                
                if (data) {
                  setTopics(current => [data, ...current]);
                }
              }
              break;
            case 'DELETE':
              setTopics(current => current.filter(topic => topic.id !== payload.old.id));
              break;
            case 'UPDATE':
              setTopics(current => 
                current.map(topic => {
                  if (topic.id === payload.new.id) {
                    // If filter is not 'all', remove topics that don't match the filter
                    if (filter !== 'all' && payload.new.status !== filter) {
                      return null;
                    }
                    return payload.new;
                  }
                  return topic;
                }).filter(Boolean)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="newspaper-container">
        <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
          <h1 className="newspaper-headline">Latest Discussions</h1>
          <Link href="/create" className="newspaper-button">
            New Topic
          </Link>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:gap-6 mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="newspaper-select"
          >
            <option value="open">Active Discussions</option>
            <option value="done">Archived</option>
            <option value="all">All Topics</option>
          </select>
          <input
            type="text"
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="newspaper-input md:flex-grow"
          />
        </div>

        <div className="newspaper-grid">
          {topics.map(topic => (
            <article key={topic.id} className="newspaper-article">
              <h2 className="newspaper-subheading">{topic.title}</h2>
              <div className="newspaper-meta">
                By {topic.author?.username || 'Anonymous'} • 
                <span className={`ml-2 ${
                  topic.status === 'open' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {topic.status === 'open' ? 'Ongoing' : 'Concluded'}
                </span>
              </div>
              <p className="font-serif text-gray-300 mb-4 leading-relaxed">
                {topic.description?.substring(0, 150)}
                {topic.description?.length > 150 ? '...' : ''}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Link href={`/topic/${topic.id}`} className="newspaper-link">
                  Read Full Discussion →
                </Link>
                {topic.meeting_link && (
                  <a 
                    href={topic.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-400 hover:text-green-300 underline"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
