import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Updated type to match backend requirements
export type NewListingInput = {
  title: string;
  location: string;
  price: number;
  area?: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  tags: string[];
  type: "Private" | "Shared" | "Studio" | "Hostel";
  // Optional fields that backend supports
  description?: string;
  amenities?: string[];
  availableFrom?: string; // Will be mapped to availaibleFrom in API call
  deposit?: string;
  maintenance?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
};

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: NewListingInput) => Promise<void>;
};

const AddListingModal = ({ isOpen, onClose, onSubmit }: AddListingModalProps) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<string>("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("1");
  const [bathrooms, setBathrooms] = useState<string>("1");
  const [imageUrls, setImageUrls] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"Private" | "Shared" | "Studio" | "Hostel">("Private");
  const [isLoading, setIsLoading] = useState(false);

  // Additional fields for backend
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [deposit, setDeposit] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [parking, setParking] = useState<boolean>(false);
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [furnished, setFurnished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArr = Array.from(files);
      const imagePromises = fileArr.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result;
              if (typeof result === "string") {
                resolve(result);
              } else {
                reject(new Error(`Failed to read file: ${file.name}`));
              }
            };
            reader.onerror = () => {
              reject(new Error(`Error reading file: ${file.name}`));
            };
            reader.readAsDataURL(file);
          })
      );

      Promise.all(imagePromises)
        .then((newImages: string[]) => {
          setUploadedImages((prev) => [...prev, ...newImages]);
        })
        .catch((error) => {
          console.error("Image upload error:", error);
          alert(`Failed to upload one or more images: ${error.message}`);
        });
    }
  };

  const handleRemoveUploadedImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const priceNum = parseInt(price, 10) || 0;
      const imagesFromUrls = imageUrls.split(",").map((s) => s.trim()).filter(Boolean);
      const tagList = tags.split(",").map((s) => s.trim()).filter(Boolean);
      const amenitiesList = amenities.split(",").map((s) => s.trim()).filter(Boolean);
      const allImages = [...uploadedImages, ...imagesFromUrls];

      // Build the listing data object - Fixed conditional logic
      const listingData: NewListingInput = {
        title,
        location,
        price: priceNum,
        bedrooms: parseInt(bedrooms, 10) || 1,
        bathrooms: parseInt(bathrooms, 10) || 1,
        images: allImages.length
          ? allImages
          : ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1470&auto=format&fit=crop"],
        tags: tagList,
        type,
        parking,
        petFriendly,
        furnished,
        // Always include deposit and maintenance as strings
        deposit: deposit.trim() || "",
        maintenance: maintenance.trim() || "",
      };

      // Add optional string fields - only if they have actual content
      if (area.trim()) {
        listingData.area = area.trim();
      }

      if (description.trim()) {
        listingData.description = description.trim();
      }

      if (amenitiesList.length > 0) {
        listingData.amenities = amenitiesList;
      }

      if (availableFrom) {
        listingData.availableFrom = availableFrom;
      }

      console.log("=== FORM DATA DEBUG ===");
      console.log("Raw deposit value:", `"${deposit}"`);
      console.log("Raw maintenance value:", `"${maintenance}"`);
      console.log("Processed deposit:", `"${listingData.deposit}"`);
      console.log("Processed maintenance:", `"${listingData.maintenance}"`);
      console.log("Full listing data:", JSON.stringify(listingData, null, 2));
      await onSubmit(listingData);
      
      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setPrice("");
    setArea("");
    setBedrooms("1");
    setBathrooms("1");
    setImageUrls("");
    setTags("");
    setType("Private");
    setUploadedImages([]);
    setDescription("");
    setAmenities("");
    setAvailableFrom("");
    setDeposit("");
    setMaintenance("");
    setParking(false);
    setPetFriendly(false);
    setFurnished(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Listing</h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Spacious 2BHK in Downtown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Area, City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹/month) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bathrooms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="1200 sq ft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "Private" | "Shared" | "Studio" | "Hostel")
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="Private">Private Room</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                {/* Pricing Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="text"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maintenance (₹/month)
                  </label>
                  <input
                    type="text"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Describe your room, neighborhood, and any special features..."
                  />
                </div>

                {/* Amenities Checkboxes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Property Features
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={parking}
                        onChange={(e) => setParking(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Parking Available</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={petFriendly}
                        onChange={(e) => setPetFriendly(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Pet Friendly</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={furnished}
                        onChange={(e) => setFurnished(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Furnished</span>
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="mb-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`upload-${idx}`}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or paste Image URLs (comma separated)
                  </label>
                  <textarea
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Balcony, Near Metro, Quiet Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Amenities (comma separated)
                  </label>
                  <input
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="AC, WiFi, Kitchen, Washing Machine"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Creating..." : "Create Listing"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddListingModal;