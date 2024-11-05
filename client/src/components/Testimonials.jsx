import { testimonialsData } from "../assets/assets";

const Testimonials = () => {
  console.log(testimonialsData);
  return (
    <div className="m-4 lg:mx-60 py-20 xl:py-30">
      {/* Header */}
      <h1 className="mb-12 sm:mb-20 text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent ">
        Customer Testimonials
      </h1>
      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto px-4 py-8">
        {testimonialsData.map((item, index) => (
          <div
            className="bg-white rounded-xl p-6 drop-shadow-md m-auto hover:scale-105 transition-all duration-700 "
            key={index}
          >
            <p className="text-4xl text-gray-500">&ldquo;</p>
            <p className="text-sm text-gray-500">{item.text}</p>
            <div className="flex items-center gap-3 mt-5">
              <img className="w-9 rounded-full" src={item.image} />
              <div>
                <p>{item.author}</p>
                <p className="text-sm text-gray-600">{item.jobTitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
