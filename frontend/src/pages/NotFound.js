import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <span className="font-display text-3xl font-bold text-secondary-900">
            InkCraft
          </span>
        </Link>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-600">404</span>
          </div>
          
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-xl text-secondary-600 mb-8">
            Oops! The page you're looking for doesn't exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/">
            <Button variant="primary" size="large" fullWidth>
              Go Home
            </Button>
          </Link>
          
          <Link to="/gallery">
            <Button variant="outline" size="large" fullWidth>
              Browse Gallery
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button variant="ghost" size="large" fullWidth>
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-secondary-200">
          <p className="text-sm text-secondary-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/book" className="text-primary-600 hover:text-primary-500">
              Book Appointment
            </Link>
            <Link to="/ai-design" className="text-primary-600 hover:text-primary-500">
              AI Design Generator
            </Link>
            <Link to="/chat" className="text-primary-600 hover:text-primary-500">
              Chat Support
            </Link>
            <Link to="/about" className="text-primary-600 hover:text-primary-500">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;