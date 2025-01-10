const Testimonial_section=()=>{
  return (
     <>
        <section id="testimonials" className="py-12 bg-white">
           <div className="container mx-auto text-center px-8">
              <h3 className="text-3xl font-bold mb-6">What Our Users Say</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                    <p className="text-gray-600 italic mb-4">
                       "This platform made it so easy to manage my investments.
                       Highly recommend!"
                    </p>
                    <h4 className="font-bold">- Jane Doe</h4>
                 </div>
                 <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                    <p className="text-gray-600 italic mb-4">
                       "The analytics and insights are top-notch. It’s a
                       game-changer."
                    </p>
                    <h4 className="font-bold">- John Smith</h4>
                 </div>
              </div>
           </div>
        </section>
     </>
  );
}

export default  Testimonial_section