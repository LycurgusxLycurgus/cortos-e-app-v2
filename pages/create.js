import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

const CreateTopic = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      alert("Please log in to create a topic.");
      return;
    }

    const { error } = await supabase
      .from('topics')
      .insert([
        {
          title,
          description,
          meeting_link: meetingLink,
          author_id: user.id,
          status: "open"
        }
      ]);
    if (!error) {
      router.push('/');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="newspaper-container">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 border-b-2 border-black pb-4">
            <h1 className="newspaper-headline">Start a New Discussion</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block font-serif text-base md:text-lg mb-2">
                Discussion Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="newspaper-input"
                placeholder="What would you like to discuss?"
              />
            </div>

            <div>
              <label className="block font-serif text-lg mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="newspaper-input"
                rows="6"
                placeholder="Provide some context for the discussion..."
              ></textarea>
            </div>

            <div>
              <label className="block font-serif text-lg mb-2">
                Virtual Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="newspaper-input"
                placeholder="https://meet.example.com/..."
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button type="submit" className="newspaper-button">
                Publish Discussion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTopic;
