import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      title: "Smart Weather Assistant",
      search: "Search",
      useLocation: "Use My Location",
      rainfallAlerts: "Rainfall Alerts",
      noRain: "☀️ No rain expected",
      expectedRain: "🌧️ Expected ({{amount}} mm)",
      forecast: "5-Day Forecast",
      farmerAdvice: "Farmer Advice",
      advice: {
        rain: "☔ Heavy rainfall expected — cover stored grains & delay irrigation.",
        cloud: "🌥️ Cloudy day — suitable for fertilizer application.",
        clearHot: "☀️ Hot & dry — good day for harvesting wheat, maize, or cotton.",
        clearNormal: "🌾 Clear skies — suitable for sowing or harvesting pulses & cereals.",
        storm: "⚠️ Thunderstorm warning — secure loose items & avoid spraying pesticides.",
        normal: "🪴 Normal weather — continue regular farm activities."
      }
    }
  },
  hi: {
    translation: {
      title: "स्मार्ट वेदर असिस्टेंट",
      search: "खोजें",
      useLocation: "मेरी स्थिति का उपयोग करें",
      rainfallAlerts: "वर्षा चेतावनी",
      noRain: "☀️ बारिश की संभावना नहीं",
      expectedRain: "🌧️ संभावना ({{amount}} मिमी)",
      forecast: "५-दिवसीय पूर्वानुमान",
      farmerAdvice: "किसान सलाह",
      advice: {
        rain: "☔ भारी वर्षा की संभावना — अनाज ढकें और सिंचाई स्थगित करें।",
        cloud: "🌥️ बादल वाला दिन — उर्वरक डालने के लिए उपयुक्त।",
        clearHot: "☀️ गर्म और शुष्क — गेहूँ, मक्का या कपास की कटाई के लिए अच्छा दिन।",
        clearNormal: "🌾 साफ आसमान — दालें और अनाज बोने या काटने के लिए उपयुक्त।",
        storm: "⚠️ तूफ़ान की चेतावनी — ढीली वस्तुएँ सुरक्षित करें।",
        normal: "🪴 सामान्य मौसम — नियमित खेती गतिविधियाँ जारी रखें।"
      }
    }
  },
  mr: {
    translation: {
      title: "स्मार्ट हवामान सहाय्यक",
      search: "शोधा",
      useLocation: "माझे स्थान वापरा",
      rainfallAlerts: "पावसाची सूचना",
      noRain: "☀️ पाऊस होण्याची शक्यता नाही",
      expectedRain: "🌧️ अपेक्षित ({{amount}} मिमी)",
      forecast: "५-दिवसांचा अंदाज",
      farmerAdvice: "शेतकरी सल्ला",
      advice: {
        rain: "☔ मुसळधार पाऊस — धान्य झाकून ठेवा आणि सिंचन पुढे ढकला.",
        cloud: "🌥️ ढगाळ वातावरण — खत टाकण्यासाठी योग्य दिवस.",
        clearHot: "☀️ उष्ण आणि कोरडे — गहू, मका किंवा कापूस कापणीसाठी योग्य दिवस.",
        clearNormal: "🌾 स्वच्छ आकाश — डाळी व धान्ये पेरणी किंवा कापणीसाठी योग्य.",
        storm: "⚠️ वादळाची सूचना — सैल वस्तू सुरक्षित ठेवा.",
        normal: "🪴 सामान्य हवामान — नियमित शेतीचे काम सुरू ठेवा."
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
