import React, { useState } from 'react';
import { useForm } from '../hooks/useForm';
import { isValidEmail, isValidPhone } from '../utils/helpers';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Textarea from '../components/UI/Textarea';
import Select from '../components/UI/Select';
import Alert from '../components/UI/Alert';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const { isDark } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiryTypes = [
    { value: 'booking', label: 'Booking Inquiry' },
    { value: 'design', label: 'Design Consultation' },
    { value: 'pricing', label: 'Pricing Information' },
    { value: 'aftercare', label: 'Aftercare Support' },
    { value: 'general', label: 'General Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  const validationRules = {
    name: [
      (value) => !value ? 'Name is required' : '',
      (value) => value && value.length < 2 ? 'Name must be at least 2 characters' : ''
    ],
    email: [
      (value) => !value ? 'Email is required' : '',
      (value) => value && !isValidEmail(value) ? 'Please enter a valid email' : ''
    ],
    phone: [
      (value) => value && !isValidPhone(value) ? 'Please enter a valid phone number' : ''
    ],
    inquiryType: [(value) => !value ? 'Please select an inquiry type' : ''],
    subject: [
      (value) => !value ? 'Subject is required' : '',
      (value) => value && value.length < 3 ? 'Subject must be at least 3 characters' : ''
    ],
    message: [
      (value) => !value ? 'Message is required' : '',
      (value) => value && value.length < 10 ? 'Message must be at least 10 characters' : ''
    ]
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    resetForm
  } = useForm(
    {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      subject: '',
      message: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Contact form submitted:', values);
      
      setShowSuccess(true);
      resetForm();
      
      // Hide success alert after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone',
      details: '(011) 229-9213',
      description: 'Mon-Fri 9AM-5PM, Sat 10AM-6PM'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      details: 'hello@inkcraft.studio',
      description: 'We respond within 24 hours'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Address',
      details: 'Minuwangoda, Gampaha, Sri Lanka',
      description: ''
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Live Chat',
      details: 'Chat with our AI assistant',
      description: 'Available 24/7 for instant help'
    }
  ];

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our online booking system, call us directly, or visit our studio. We recommend booking 2-4 weeks in advance.'
    },
    {
      question: 'What are your pricing ranges?',
      answer: 'Pricing varies by size and complexity. Small tattoos start around $100-300, medium pieces $300-600, and larger work $600+. We provide detailed quotes during consultations.'
    },
    {
      question: 'Do you require a deposit?',
      answer: 'Yes, we require a $50-100 deposit to secure your appointment. The deposit is applied to your final tattoo cost and is non-refundable if you cancel within 48 hours.'
    },
    {
      question: 'What should I bring to my appointment?',
      answer: 'Bring a valid government-issued ID, reference images if you have them, and wear comfortable clothing that provides access to the tattoo area.'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Header */}
      <section className={isDark ? 'gradient-bg-hero text-white py-16' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16'}>
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-purple-100'}`}>
              Have questions about our services, want to book an appointment, or need aftercare advice? 
              We're here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      <section className={`section-padding ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Send Us a Message</h2>
                
                {showSuccess && (
                  <Alert type="success" onClose={() => setShowSuccess(false)} className="mb-6">
                    Thank you for your message! We\'ll get back to you within 24 hours.
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Enter your name"
                      value={values.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      error={touched.name ? errors.name : ''}
                      required
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      error={touched.email ? errors.email : ''}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter your phone (optional)"
                      value={values.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone ? errors.phone : ''}
                      optional
                    />
                    
                    <Select
                      label="Inquiry Type"
                      value={values.inquiryType}
                      onChange={(e) => handleChange('inquiryType', e.target.value)}
                      onBlur={() => handleBlur('inquiryType')}
                      error={touched.inquiryType ? errors.inquiryType : ''}
                      options={inquiryTypes}
                      placeholder="Select inquiry type"
                      required
                    />
                  </div>
                  
                  <Input
                    label="Subject"
                    type="text"
                    placeholder="Brief description of your inquiry"
                    value={values.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    error={touched.subject ? errors.subject : ''}
                    required
                  />
                  
                  <Textarea
                    label="Message"
                    placeholder="Please provide details about your inquiry, including any specific questions or requirements..."
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    error={touched.message ? errors.message : ''}
                    rows={6}
                    required
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
            
            {/* Contact Info & Other Sections */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gold-500/10 text-gold-500' : 'bg-blue-100 text-blue-600'}`}>
                        {method.icon}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{method.title}</h4>
                        <p className={`font-medium ${isDark ? 'text-gold-400' : 'text-gray-700'}`}>{method.details}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Hours */}
              <div className={`card ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Studio Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Monday - Friday</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Saturday</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Sunday</span>
                    <span className="font-medium text-red-600">Closed</span>
                  </div>
                </div>
                
                <div className={`mt-4 pt-4 ${isDark ? 'border-t border-dark-700' : 'border-t border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    📞 <strong>Emergency aftercare support:</strong> Available 24/7 via phone or live chat
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <a href="/book">
                  <Button variant="primary" size="large" fullWidth>
                    Book Appointment
                  </Button>
                </a>
                
                <a href="/chat">
                  <Button variant="outline" size="large" fullWidth>
                    Start Live Chat
                  </Button>
                </a>
                
                <a href="/gallery">
                  <Button variant="ghost" size="large" fullWidth>
                    View Our Work
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`section-padding ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Quick answers to common questions. Don't see what you're looking for? Feel free to contact us directly.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className={`card ${isDark ? 'bg-dark-850 border border-dark-700' : 'bg-white'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Still have questions?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/chat">
                  <Button variant="primary">
                    Chat with Us
                  </Button>
                </a>
                <a href="tel:+15551234567">
                  <Button variant="outline">
                    Call Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-0">
        <div className="w-full h-64 bg-gradient-to-r from-secondary-200 to-primary-200 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-secondary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-secondary-600 font-medium">Interactive Map Coming Soon</p>
            <p className="text-sm text-secondary-500">123 Art Street, Creative Quarter</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;