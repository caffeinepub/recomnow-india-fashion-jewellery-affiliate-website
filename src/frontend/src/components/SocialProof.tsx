import { memo, useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Anjali Das',
    location: 'Kolkata',
    rating: 5,
    text: 'Amazing quality saree at such a great price! Delivered quickly through Amazon.',
    product: 'Banarasi Saree',
  },
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Beautiful jewellery collection. Exactly as shown in pictures. Highly recommend!',
    product: 'Costume Jewellery Set',
  },
  {
    name: 'Ritu Banerjee',
    location: 'Kolkata',
    rating: 4,
    text: 'Great deals on festive wear. The quality exceeded my expectations.',
    product: 'Lehenga Choli',
  },
  {
    name: 'Sneha Gupta',
    location: 'Delhi',
    rating: 5,
    text: 'Love the kurti collection! Perfect fit and excellent fabric quality.',
    product: 'Designer Kurti',
  },
];

const recentPurchases = [
  { name: 'Anjali', location: 'Kolkata', product: 'Banarasi Saree', time: '5 mins ago' },
  { name: 'Priya', location: 'Mumbai', product: 'Costume Jewellery', time: '12 mins ago' },
  { name: 'Ritu', location: 'Kolkata', product: 'Lehenga Choli', time: '18 mins ago' },
  { name: 'Sneha', location: 'Delhi', product: 'Designer Kurti', time: '25 mins ago' },
  { name: 'Meera', location: 'Bangalore', product: 'Salwar Suit', time: '32 mins ago' },
];

const SocialProof = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentPurchases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-gold-50 to-navy-50" aria-labelledby="social-proof-heading">
      <div className="container mx-auto px-4">
        <h2 id="social-proof-heading" className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-900">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg border-2 border-gold-300 hover:border-gold-500 transition-all"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? 'fill-gold-600 text-gold-600'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-navy-800 mb-4 leading-relaxed font-medium">"{testimonial.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-navy-900">{testimonial.name}</p>
                  <p className="text-sm text-navy-600">{testimonial.location}</p>
                </div>
                <p className="text-xs text-gold-700 font-semibold bg-gold-100 px-3 py-1 rounded-full">
                  {testimonial.product}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gold-400 p-6">
          <h3 className="text-xl font-bold text-center mb-4 text-navy-900">Recently Bought</h3>
          <div className="overflow-hidden">
            <div
              className="transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentIndex * 100}%)` }}
            >
              {recentPurchases.map((purchase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gold-200 last:border-0"
                  style={{ height: '60px' }}
                >
                  <div>
                    <p className="font-bold text-navy-900">
                      {purchase.name} from {purchase.location}
                    </p>
                    <p className="text-sm text-navy-700">purchased {purchase.product}</p>
                  </div>
                  <p className="text-xs text-gold-700 font-semibold bg-gold-100 px-3 py-1 rounded-full">
                    {purchase.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SocialProof.displayName = 'SocialProof';

export default SocialProof;
