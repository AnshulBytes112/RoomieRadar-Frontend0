import { useState } from "react";
import AddListingModal from "../components/AddListingModal";
import { createRoomListing } from "../api";

const AddListingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always open modal on this page
  const handleClose = () => {
    // You can navigate away or show a message
    window.history.back();
  };

  const handleSubmit = async (roomData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Map the data to match backend Room entity exactly
      const apiData = {
        title: roomData.title,
        location: roomData.location,
        price: roomData.price, // Already a number from modal
        area: roomData.area || "",
        bedrooms: roomData.bedrooms,
        bathrooms: roomData.bathrooms,
        images: roomData.images,
        tags: roomData.tags,
        type: roomData.type,
        
        // Optional fields - match backend field names exactly
        ...(roomData.description && { description: roomData.description }),
        ...(roomData.amenities && { amenities: roomData.amenities }),
        // Note: Backend has typo "availaibleFrom" not "availableFrom"
        ...(roomData.availableFrom && { availaibleFrom: roomData.availableFrom }),
        ...(roomData.deposit && { deposit: roomData.deposit }),
        ...(roomData.maintenance && { maintenance: roomData.maintenance }),
        ...(roomData.parking !== undefined && { parking: roomData.parking }),
        ...(roomData.petFriendly !== undefined && { petFriendly: roomData.petFriendly }),
        ...(roomData.furnished !== undefined && { furnished: roomData.furnished }),
        // Note: postedBy will be set by backend based on authenticated user
      };

      console.log('Creating room listing with payload:', apiData);
      const result = await createRoomListing(apiData);
      console.log('Room created successfully:', result);

      // Navigate back after success
      window.history.back();
    } catch (err: any) {
      console.error('Failed to create room listing:', err);
      
      // Better error handling
      let errorMessage = 'Failed to create listing. Please try again.';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <AddListingModal 
        isOpen={true} 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
            <p className="text-gray-700 font-medium">Creating listing...</p>
          </div>
        </div>
      )}
      
      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl z-50 max-w-md shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Error</h4>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-white/80 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddListingPage;