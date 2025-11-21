// Receipt Scanner Component - Add this to your existing app

// This component will be available globally and can be called from your main app
window.ReceiptScannerComponent = function({ onReceiptScanned, onClose }) {
    const [isScanning, setIsScanning] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState(null);
    const [extractedData, setExtractedData] = React.useState(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const processReceipt = async (imageFile) => {
        setIsScanning(true);
        setPreviewImage(URL.createObjectURL(imageFile));

        try {
            // Use Tesseract.js for OCR
            const { data: { text } } = await Tesseract.recognize(
                imageFile,
                'eng',
                {
                    logger: m => console.log(m)
                }
            );

            console.log('Extracted text:', text);

            // Parse the text to find subscription details
            const parsed = parseReceiptText(text);
            setExtractedData(parsed);
            setIsScanning(false);

            // Auto-fill if data found
            if (parsed.name || parsed.cost) {
                onReceiptScanned(parsed);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Failed to scan receipt. Please try again or enter manually.');
            setIsScanning(false);
        }
    };

    const parseReceiptText = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        const data = {
            name: '',
            cost: '',
            billing_cycle: 'Monthly',
            category: 'Other'
        };

        // Look for price patterns ($XX.XX or XX.XX)
        const priceRegex = /\$?\d+\.?\d{0,2}/g;
        const prices = text.match(priceRegex);
        if (prices && prices.length > 0) {
            // Take the largest price (likely the total)
            const amounts = prices.map(p => parseFloat(p.replace('$', '')));
            data.cost = Math.max(...amounts).toFixed(2);
        }

        // Look for common subscription services
        const services = [
            'netflix', 'spotify', 'hulu', 'disney', 'amazon prime', 
            'apple', 'youtube', 'hbo', 'paramount', 'peacock',
            'adobe', 'microsoft', 'google', 'dropbox', 'zoom'
        ];
        
        const lowerText = text.toLowerCase();
        for (const service of services) {
            if (lowerText.includes(service)) {
                data.name = service.charAt(0).toUpperCase() + service.slice(1);
                
                // Guess category based on service
                if (['netflix', 'hulu', 'disney', 'hbo', 'paramount'].includes(service)) {
                    data.category = 'Streaming';
                } else if (['spotify', 'apple music', 'youtube music'].includes(service)) {
                    data.category = 'Music';
                } else if (['adobe', 'microsoft', 'google', 'zoom'].includes(service)) {
                    data.category = 'Software';
                }
                break;
            }
        }

        // Look for billing cycle keywords
        if (/month|monthly/i.test(text)) {
            data.billing_cycle = 'Monthly';
        } else if (/year|annual|yearly/i.test(text)) {
            data.billing_cycle = 'Yearly';
        }

        // Look for dates (for next billing date)
        const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
        const dates = text.match(dateRegex);
        if (dates && dates.length > 0) {
            data.next_billing_date = dates[0];
        }

        return data;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            processReceipt(file);
        } else {
            alert('Please select an image file');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processReceipt(file);
        } else {
            alert('Please drop an image file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="card-frosted rounded-2xl p-8 max-w-2xl w-full shadow-2xl receipt-scanner-container" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            📸 Receipt Scanner
                        </h2>
                        <p className="text-white/80">Upload a receipt or confirmation email screenshot</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {!previewImage && !isScanning && (
                    <div
                        className={`receipt-upload-zone p-12 rounded-2xl text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Drop receipt image here
                        </h3>
                        <p className="text-white/70 mb-4">or click to browse</p>
                        <p className="text-sm text-white/50">
                            Supports: JPG, PNG, PDF screenshots
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {isScanning && (
                    <div className="text-center py-12">
                        <div className="ocr-loading mx-auto mb-4"></div>
                        <p className="text-white text-lg font-semibold mb-2">Scanning receipt...</p>
                        <p className="text-white/70 text-sm">Using AI to extract subscription details</p>
                        
                        {previewImage && (
                            <div className="mt-6 relative">
                                <img src={previewImage} alt="Receipt preview" className="receipt-preview mx-auto rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent scanning-animation"></div>
                            </div>
                        )}
                    </div>
                )}

                {extractedData && !isScanning && (
                    <div className="card-frosted rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-green-600">
                            <div className="success-checkmark text-4xl">✓</div>
                            <h3 className="text-xl font-bold">Data Extracted!</h3>
                        </div>

                        {previewImage && (
                            <img src={previewImage} alt="Receipt" className="w-full h-40 object-cover rounded-xl mb-4" />
                        )}

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Service Name:</span>
                                <span className="font-bold text-primary-text">{extractedData.name || 'Not detected'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Cost:</span>
                                <span className="font-bold text-primary-orange">${extractedData.cost || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Billing Cycle:</span>
                                <span className="font-bold text-primary-blue">{extractedData.billing_cycle}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Category:</span>
                                <span className="font-bold text-primary-turquoise">{extractedData.category}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    onReceiptScanned(extractedData);
                                    onClose();
                                }}
                                className="flex-1 gradient-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                ✓ Use This Data
                            </button>
                            <button
                                onClick={() => {
                                    setPreviewImage(null);
                                    setExtractedData(null);
                                }}
                                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                            >
                                Scan Another
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            💡 Tip: You can edit any field after adding to your subscriptions
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.ReceiptScanner = window.ReceiptScannerComponent;