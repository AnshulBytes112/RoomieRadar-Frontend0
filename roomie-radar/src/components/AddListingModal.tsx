import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, Plus, Trash2, MapPin, DollarSign, Home, Key, Shield, Image as ImageIcon } from 'lucide-react';
import { createPortal } from "react-dom";

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
  description?: string;
  amenities?: string[];
  availableFrom?: string;
  deposit?: string;
  maintenance?: string;
  mapLink?: string;
  contactEmail?: string;
  houseRules?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  houseDetails?: string;
  id?: number;
  genderPreference?: string;
  totalOccupancy?: number;
  occupiedCount?: number;
};

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: NewListingInput) => Promise<void>;
  initialData?: NewListingInput | null;
  isEditing?: boolean;
};

const AddListingModal = ({ isOpen, onClose, onSubmit, initialData, isEditing = false }: AddListingModalProps) => {
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
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [deposit, setDeposit] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [parking, setParking] = useState<boolean>(false);
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [furnished, setFurnished] = useState<boolean>(false);
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [mapLink, setMapLink] = useState(""); // Map Link State
  const [houseRules, setHouseRules] = useState("");
  const [houseDetails, setHouseDetails] = useState("");
  const [genderPreference, setGenderPreference] = useState("Any");
  const [totalOccupancy, setTotalOccupancy] = useState<string>("1");
  const [occupiedCount, setOccupiedCount] = useState<string>("0");

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        setTitle(initialData.title || "");
        setLocation(initialData.location || "");
        setPrice(initialData.price?.toString() || "");
        setArea(initialData.area || "");
        setBedrooms(initialData.bedrooms?.toString() || "1");
        setBathrooms(initialData.bathrooms?.toString() || "1");
        setUploadedImages(initialData.images || []);
        setImageUrls("");
        setTags(initialData.tags?.join(", ") || "");
        setType(initialData.type || "Private");
        setDescription(initialData.description || "");
        setAmenities(initialData.amenities?.join(", ") || "");
        setAvailableFrom(initialData.availableFrom || "");
        setDeposit(initialData.deposit || "");
        setMaintenance(initialData.maintenance || "");
        setParking(initialData.parking || false);
        setPetFriendly(initialData.petFriendly || false);
        setFurnished(initialData.furnished || false);
        setContactNumber(initialData.contactNumber || "");
        setContactEmail(initialData.contactEmail || "");
        setMapLink(initialData.mapLink || "");
        setHouseRules(initialData.houseRules || "");
        setHouseDetails(initialData.houseDetails || "");
        setGenderPreference(initialData.genderPreference || "Any");
        setTotalOccupancy(initialData.totalOccupancy?.toString() || "1");
        setOccupiedCount(initialData.occupiedCount?.toString() || "0");
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData, isEditing]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = 'unset';
    };
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
              if (typeof result === "string") resolve(result);
              else reject(new Error(`Failed to read file: ${file.name}`));
            };
            reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
            reader.readAsDataURL(file);
          })
      );
      Promise.all(imagePromises)
        .then((newImages: string[]) => setUploadedImages((prev) => [...prev, ...newImages]))
        .catch((error) => alert(`Upload error: ${error.message}`));
    }
  };

  const handleRemoveUploadedImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setTitle(""); setLocation(""); setPrice(""); setArea(""); setBedrooms("1"); setBathrooms("1");
    setImageUrls(""); setTags(""); setType("Private"); setUploadedImages([]); setDescription("");
    setAmenities(""); setAvailableFrom(""); setDeposit(""); setMaintenance(""); setParking(false);
    setPetFriendly(false); setFurnished(false); setContactNumber(""); setContactEmail(""); setMapLink("");
    setHouseRules(""); setHouseDetails(""); setGenderPreference("Any");
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

      const listingData: NewListingInput = {
        title, location, price: priceNum,
        bedrooms: parseInt(bedrooms, 10) || 1,
        bathrooms: parseInt(bathrooms, 10) || 1,
        images: allImages.length ? allImages : ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1470&auto=format&fit=crop"],
        tags: tagList, type, parking, petFriendly, furnished,
        deposit: deposit.trim() || undefined,
        maintenance: maintenance.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        mapLink: mapLink.trim() || undefined,
        houseRules: houseRules.trim() || undefined,
        houseDetails: houseDetails.trim() || undefined,
        genderPreference,
        totalOccupancy: parseInt(totalOccupancy) || 1,
        occupiedCount: parseInt(occupiedCount) || 0,
        contactNumber: contactNumber.trim() || undefined
      };

      if (area.trim()) listingData.area = area.trim();
      if (description.trim()) listingData.description = description.trim();
      if (amenitiesList.length > 0) listingData.amenities = amenitiesList;
      if (availableFrom) listingData.availableFrom = availableFrom;

      await onSubmit(listingData);
      resetForm();
      onClose();
    } catch (error) {
      alert(`Submission error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white tracking-widest text-[13px] placeholder:text-gray-700";
  const labelClasses = "flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1.5 ml-1";

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-20 sm:p-6 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ y: 50, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.98 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-trae-green/50 via-emerald-400 to-blue-500/50 opacity-40" />

          <div className="flex items-center justify-between p-6 sm:px-10 border-b border-white/5 bg-[#0a0a0a]/50">
            <div>
              <div className="text-trae-green font-mono text-[9px] uppercase font-black tracking-widest mb-1">Listing Details</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                {isEditing ? "Edit Property" : "List a New Room"}
              </h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:px-10 scrollbar-hide space-y-10">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}><Home className="w-3 h-3" /> Property Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClasses} placeholder="e.g. Modern 2BHK Apartment" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}><MapPin className="w-3 h-3" /> Area / Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} required className={inputClasses} placeholder="e.g. Koramangala, Bangalore" />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Map Link (Optional)</label>
                <div className="relative group/input">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4 h-4" />
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    className={inputClasses}
                    placeholder="Paste Google Maps Link"
                  />
                </div>
              </div>

              {/* Map Link - Added */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Map Link (Optional)</label>
                <div className="relative group/input">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4 h-4" />
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    className={inputClasses}
                    placeholder="Paste Google Maps Link"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}><DollarSign className="w-3 h-3" /> Monthly Rent (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClasses} placeholder="25000" />
              </div>
            </div>

            {/* Property Mechanics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Bedrooms', val: bedrooms, set: setBedrooms, icon: 'B' },
                { label: 'Bathrooms', val: bathrooms, set: setBathrooms, icon: 'T' },
                { label: 'Area (Sqft)', val: area, set: setArea, type: 'text' },
                { label: 'Property Type', val: type, set: setType, isSelect: true }
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <label className={labelClasses}>{field.label}</label>
                  {field.isSelect ? (
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className={inputClasses}>
                      <option value="Private" className="bg-[#0a0a0a]">PRIVATE</option>
                      <option value="Shared" className="bg-[#0a0a0a]">SHARED</option>
                      <option value="Studio" className="bg-[#0a0a0a]">STUDIO</option>
                      <option value="Hostel" className="bg-[#0a0a0a]">HOSTEL</option>
                    </select>
                  ) : (
                    <input type={field.type || 'number'} value={field.val} onChange={(e) => (field.set as any)(e.target.value)} className={inputClasses} />
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className={labelClasses}>Gender Preference</label>
                <select value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} className={inputClasses}>
                  <option value="Any" className="bg-[#0a0a0a]">ANY</option>
                  <option value="Male" className="bg-[#0a0a0a]">MALE</option>
                  <option value="Female" className="bg-[#0a0a0a]">FEMALE</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}>Total Occupancy</label>
                <input type="number" value={totalOccupancy} onChange={(e) => setTotalOccupancy(e.target.value)} className={inputClasses} placeholder="1" min="1" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}>Currently Occupied</label>
                <input type="number" value={occupiedCount} onChange={(e) => setOccupiedCount(e.target.value)} className={inputClasses} placeholder="0" min="0" />
              </div>
            </div>

            {/* Advanced Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className={labelClasses}><Key className="w-3 h-3" /> Security Deposit</label>
                <input value={deposit} onChange={(e) => setDeposit(e.target.value)} className={inputClasses} placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}><Shield className="w-3 h-3" /> Maintenance Fee (Monthly)</label>
                <input value={maintenance} onChange={(e) => setMaintenance(e.target.value)} className={inputClasses} placeholder="2000" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}>Available From</label>
                <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className={inputClasses} />
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-5">
              <label className={labelClasses}>Property Features</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Parking Available', state: parking, set: setParking },
                  { label: 'Pet Friendly', state: petFriendly, set: setPetFriendly },
                  { label: 'Fully Furnished', state: furnished, set: setFurnished }
                ].map((feat) => (
                  <button key={feat.label} type="button" onClick={() => feat.set(!feat.state)} className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all ${feat.state ? 'bg-trae-green text-black border-trae-green' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${feat.state ? 'bg-black' : 'bg-gray-700'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Payloads */}
            <div className="space-y-7">
              <div className="space-y-3">
                <label className={labelClasses}>About this Property (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                  rows={3}
                  className={`${inputClasses} min-h-[100px] resize-none pt-3 overflow-hidden`}
                  placeholder="Enter a detailed description of your room..."
                />
              </div>
              <div className="space-y-3">
                <label className={labelClasses}>Detailed Property Info</label>
                <textarea
                  value={houseDetails}
                  onChange={(e) => setHouseDetails(e.target.value)}
                  onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                  rows={3}
                  className={`${inputClasses} min-h-[100px] resize-none pt-3 overflow-hidden`}
                  placeholder="Add any specific details about the house..."
                />
              </div>
              <div className="space-y-3">
                <label className={labelClasses}>House Rules</label>
                <textarea
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                  rows={3}
                  className={`${inputClasses} min-h-[100px] resize-none pt-3 overflow-hidden`}
                  placeholder="e.g. No smoking, no loud music..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className={labelClasses}>General Tags</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClasses} placeholder="Balcony, Metro Nearby, Quiet..." />
                </div>
                <div className="space-y-3">
                  <label className={labelClasses}>Amenities</label>
                  <input value={amenities} onChange={(e) => setAmenities(e.target.value)} className={inputClasses} placeholder="WiFi, A/C, Laundry..." />
                </div>
              </div>
            </div>

            {/* Visual Archives */}
            <div className="space-y-5">
              <label className={labelClasses}><ImageIcon className="w-3 h-3" /> Property Photos</label>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={img} alt="archive" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveUploadedImage(idx)} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1.5 hover:border-trae-green/30 hover:bg-trae-green/5 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-700">UPLOAD</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1 opacity-50">Or paste image links (comma-separated)</p>
                  <input value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} className={inputClasses} placeholder="https://example.com/image.jpg, ..." />
                </div>
              </div>
            </div>

            {/* Comms Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={labelClasses}>Contact Number</label>
                <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className={inputClasses} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClasses}>Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClasses} placeholder="owner@email.com" />
              </div>
            </div>

            {/* Action System */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="flex-1 h-16 sm:h-14 rounded-xl bg-white/5 border border-white/10 text-gray-600 font-black uppercase tracking-[0.3em] text-[11px] sm:text-[9px] hover:text-white transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="flex-[1.5] h-16 sm:h-14 rounded-xl bg-trae-green text-black font-black uppercase tracking-[0.3em] text-[11px] sm:text-[9px] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                {isLoading ? 'Saving...' : <><Plus className="w-5 h-5 sm:w-4 sm:h-4" /> {isEditing ? "Save Changes" : "Create Listing"}</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AddListingModal;