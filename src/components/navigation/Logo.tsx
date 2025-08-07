import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">W</span>
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        wecandotoo
      </h1>
    </Link>
  );
};

export default Logo;
