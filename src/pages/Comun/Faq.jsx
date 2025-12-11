import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FAQSection = () => {
  const [faqData, setFaqData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/faq/');
        if (!response.ok)
          throw new Error("Error al obtener las preguntas frecuentes");
        const data = await response.json();
        if (!Array.isArray(data))
          throw new Error("Los datos recibidos no son válidos");
        setFaqData(data);
      } catch (error) {
        setError("Hubo un problema al cargar las preguntas frecuentes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQData();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h2 className="text-5xl font-semibold text-center mb-10 mt-10 text-gray-800">
          Preguntas Frecuentes
        </h2>
        <p className="text-lg text-gray-700 text-left mb-8">
          Bienvenido a nuestra sección de Preguntas Frecuentes (FAQ). Aquí
          encontrarás respuestas a las consultas más comunes sobre nuestros
          productos, servicios y procesos. Hemos recopilado información clave
          para brindarte claridad y ayudarte a resolver cualquier duda que
          puedas tener de manera rápida y sencilla.
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={item.id}
                className={`bg-white hover:bg-gray-100 transition-colors duration-200 rounded-2xl p-5 cursor-pointer border ${
                  activeIndex === index ? "border-green-400" : "border-gray-200"
                }`}
                onClick={() => toggleFAQ(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="flex justify-between items-center"
                  role="button"
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-xl font-medium text-gray-700">
                    {item.pregunta}
                  </h3>
                  {activeIndex === index ? (
                    <FaAngleUp className="text-gray-500" />
                  ) : (
                    <FaAngleDown className="text-gray-500" />
                  )}
                </div>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.p
                      id={`faq-answer-${index}`}
                      className="mt-4 text-gray-600 leading-relaxed"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.respuesta}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
