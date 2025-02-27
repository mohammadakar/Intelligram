

const HomePage = () => {
    // Temporary data - replace with your actual data
    const stories = [
        { id: 1, username: 'user1', image: 'https://via.placeholder.com/150' },
        { id: 2, username: 'user2', image: 'https://via.placeholder.com/150' },
        { id: 3, username: 'user3', image: 'https://via.placeholder.com/150' },
    ];

    const posts = [
        { id: 1, username: 'user1', image: 'https://via.placeholder.com/600', likes: 120 },
        { id: 2, username: 'user2', image: 'https://via.placeholder.com/600', likes: 45 },
    ];

    return (
        <div className="bg-white">
        {/* Header */}
        <header className="fixed top-0 w-full bg-white border-b z-10">
            <h1 className="text-xl font-bold text-center py-4 bg-gradient-to-r from-blue-600 to-purple-600">Intelligram</h1>
        </header>

        {/* Main Content */}
        <main className="pt-16 pb-16"> {/* Padding for header and navigation */}
            {/* Stories Section */}
            <div className="flex overflow-x-auto px-4 py-4 border-b">
            {stories.map(story => (
                <div key={story.id} className="flex flex-col items-center mx-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-purple-600 p-0.5">
                    <img
                    src={story.image}
                    alt={story.username}
                    className="w-full h-full rounded-full border-2 border-white"
                    />
                </div>
                <span className="text-xs mt-1">{story.username}</span>
                </div>
            ))}
            </div>

            {/* Posts Feed */}
            <div className="divide-y">
            {posts.map(post => (
                <div key={post.id} className="py-4">
                {/* Post Header */}
                <div className="flex items-center px-4 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2">
                    <img
                        src={post.image}
                        alt={post.username}
                        className="w-full h-full rounded-full"
                    />
                    </div>
                    <span className="font-semibold">{post.username}</span>
                </div>

                {/* Post Image */}
                <img
                    src={post.image}
                    alt={`Post by ${post.username}`}
                    className="w-full aspect-square object-cover"
                />

                {/* Engagement Buttons */}
                <div className="px-4 pt-2">
                    <div className="flex space-x-4">
                    <button className="text-2xl">❤️</button>
                    <button className="text-2xl">💬</button>
                    </div>
                    <p className="font-semibold mt-1">{post.likes} likes</p>
                </div>
                </div>
            ))}
            </div>
        </main>

        </div>
    );
};

export default HomePage;