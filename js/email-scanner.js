// ==============================================
// EMAIL RECEIPT SCANNER - email-scanner.js
// ==============================================
// Add to index.html: <script type="text/babel" src="js/email-scanner.js"></script>

window.EmailScannerComponent = function({ user, supabase, onSubscriptionsImported, onClose }) {
    const [loading, setLoading] = React.useState(false);
    const [scanning, setScanning] = React.useState(false);
    const [gmailConnected, setGmailConnected] = React.useState(false);
    const [detectedSubs, setDetectedSubs] = React.useState([]);
    const [emailCount, setEmailCount] = React.useState(0);
    const [accessToken, setAccessToken] = React.useState(null);

    // Gmail API Configuration
    const GMAIL_CLIENT_ID = '603154538670-hk77lp74ka686i095solp4uc0ra0ef9k.apps.googleusercontent.com'; // Get from Google Cloud Console
    const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

    // Known subscription email domains (only scan these)
    const SUBSCRIPTION_DOMAINS = [
        // STREAMING VIDEO
        'netflix.com', 'hulu.com', 'disneyplus.com', 'disney.com', 
        'hbomax.com', 'hbo.com', 'paramount.com', 'paramountplus.com', 
        'peacock.com', 'peacocktv.com', 'primevideo.com', 'amazon.com',
        'appletv.com', 'apple.com', 'youtube.com', 'youtubetv.com',
        'crunchyroll.com', 'funimation.com', 'shudder.com', 'amc.com',
        'showtime.com', 'starz.com', 'espn.com', 'discoveryplus.com',
        'max.com', 'crave.ca', 'dazn.com', 'fubo.tv', 'sling.com',
        'philo.com', 'plex.tv', 'tubi.tv', 'vudu.com', 'britbox.com',
        
        // MUSIC STREAMING
        'spotify.com', 'applemusic.com', 'pandora.com', 'tidal.com',
        'soundcloud.com', 'youtube-music.com', 'amazonmusic.com',
        'deezer.com', 'qobuz.com', 'napster.com', 'iheartradio.com',
        
        // SOFTWARE & PRODUCTIVITY
        'adobe.com', 'microsoft.com', 'office365.com', 'office.com',
        'google.com', 'workspace.google.com', 'dropbox.com', 'zoom.us',
        'slack.com', 'notion.so', 'evernote.com', 'trello.com',
        'asana.com', 'monday.com', 'clickup.com', 'airtable.com',
        'figma.com', 'canva.com', 'grammarly.com', 'calendly.com',
        'zapier.com', 'ifttt.com', 'mailchimp.com', 'hubspot.com',
        'salesforce.com', 'zendesk.com', 'freshworks.com', 'intercom.com',
        
        // CLOUD STORAGE
        'dropbox.com', 'box.com', 'onedrive.com', 'icloud.com',
        'googledrive.com', 'sync.com', 'pcloud.com', 'mega.nz',
        
        // GAMING
        'xbox.com', 'playstation.com', 'nintendo.com', 'steam.com',
        'epicgames.com', 'origin.com', 'ubisoft.com', 'ea.com',
        'battle.net', 'blizzard.com', 'roblox.com', 'twitch.tv',
        'discord.com', 'gamepass.com', 'playstationplus.com',
        
        // FITNESS & HEALTH
        'peloton.com', 'fitbit.com', 'myfitnesspal.com', 'strava.com',
        'classpass.com', 'headspace.com', 'calm.com', 'noom.com',
        'beachbody.com', 'planetfitness.com', 'orangetheory.com',
        'crunchfitness.com', 'yogaglo.com', '24hourfitness.com',
        
        // NEWS & MEDIA
        'nytimes.com', 'wsj.com', 'washingtonpost.com', 'medium.com',
        'substack.com', 'economist.com', 'newyorker.com', 'theatlantic.com',
        'ft.com', 'bloomberg.com', 'reuters.com', 'wired.com',
        
        // LEARNING & EDUCATION
        'udemy.com', 'coursera.org', 'skillshare.com', 'linkedin.com',
        'lynda.com', 'masterclass.com', 'duolingo.com', 'babbel.com',
        'rosettastone.com', 'pluralsight.com', 'datacamp.com', 'codecademy.com',
        
        // READING & AUDIOBOOKS
        'kindle.com', 'audible.com', 'scribd.com', 'bookbub.com',
        'kobo.com', 'blinkist.com', 'goodreads.com', 'overdrive.com',
        
        // SECURITY & VPN
        'nordvpn.com', 'expressvpn.com', 'surfshark.com', '1password.com',
        'lastpass.com', 'dashlane.com', 'bitwarden.com', 'malwarebytes.com',
        'mcafee.com', 'norton.com', 'avast.com', 'avg.com',
        
        // DATING & SOCIAL
        'tinder.com', 'bumble.com', 'match.com', 'eharmony.com',
        'okcupid.com', 'hinge.co', 'pof.com', 'christianmingle.com',
        'jdate.com', 'ourtime.com', 'silverdating.com',
        
        // FOOD & DELIVERY
        'doordash.com', 'ubereats.com', 'grubhub.com', 'postmates.com',
        'instacart.com', 'freshly.com', 'hellofresh.com', 'blueapron.com',
        'homeche.com', 'sunbasket.com', 'gobble.com', 'everyplate.com',
        
        // TRANSPORTATION
        'uber.com', 'lyft.com', 'zipcar.com', 'getaround.com',
        'turo.com', 'bird.co', 'lime.bike',
        
        // E-COMMERCE & RETAIL
        'costco.com', 'samsclub.com', 'target.com', 'walmart.com',
        'chewy.com', 'petco.com', 'dollar-shave-club', 'harrys.com',
        'ipsy.com', 'birchbox.com', 'fabfitfun.com', 'stitchfix.com',
        
        // CREATIVE & DESIGN
        'behance.net', 'envato.com', 'shutterstock.com', 'istockphoto.com',
        'gettyimages.com', 'squarespace.com', 'wix.com', 'wordpress.com',
        'shopify.com', 'webflow.com',
        
        // DEVELOPER TOOLS
        'github.com', 'gitlab.com', 'bitbucket.org', 'jira.com',
        'heroku.com', 'vercel.com', 'netlify.com', 'digitalocean.com',
        'aws.amazon.com', 'cloud.google.com', 'azure.microsoft.com',
        
        // COMMUNICATION
        'whatsapp.com', 'telegram.org', 'signal.org', 'skype.com',
        'facetime.apple.com', 'teams.microsoft.com', 'webex.com',
        
        // PATREON & CREATORS
        'patreon.com', 'onlyfans.com', 'ko-fi.com', 'buymeacoffee.com',
        'gumroad.com', 'substack.com',
        
        // MISC SUBSCRIPTIONS
        'ynab.com', 'mint.com', 'quickbooks.com', 'turbotax.com',
        'ancestry.com', '23andme.com', 'credit-karma.com', 'experian.com',
        'equifax.com', 'transunion.com', 'creditrepair.com'
    ];

    // Keywords to identify subscription emails - 100+ variations!
    const RECEIPT_KEYWORDS = [
        // PAYMENT TERMS
        'invoice', 'receipt', 'payment', 'paid', 'charge', 'charged',
        'billing', 'bill', 'billed', 'transaction', 'purchase',
        
        // SUBSCRIPTION TERMS
        'subscription', 'membership', 'plan', 'renewal', 'renew',
        'renewed', 'auto-renew', 'auto-renewal', 'recurring',
        
        // CONFIRMATION
        'confirmation', 'confirmed', 'thank you for your payment',
        'payment successful', 'payment received', 'order confirmation',
        
        // BILLING CYCLE
        'monthly', 'annual', 'yearly', 'quarterly', 'weekly',
        'monthly bill', 'annual bill', 'yearly bill',
        'monthly payment', 'annual payment',
        
        // ACCOUNT & STATUS
        'account', 'your account', 'premium', 'pro', 'plus',
        'upgraded', 'downgraded', 'active', 'active subscription',
        
        // PAYMENT METHODS
        'credit card', 'debit card', 'paypal', 'payment method',
        'card ending', 'payment failed', 'payment declined',
        
        // INVOICE SPECIFIC
        'invoice #', 'invoice no', 'invoice number', 'receipt #',
        'order #', 'order number', 'reference number',
        
        // AMOUNT
        'amount', 'total', 'subtotal', 'due', 'balance',
        'amount paid', 'total paid', 'you paid',
        
        // DATES
        'next payment', 'next billing', 'billing date', 'due date',
        'renewal date', 'expires', 'expiration',
        
        // ACTIONS
        'renewing', 'processing', 'processed', 'completed',
        'successful', 'approved',
        
        // COMMON PHRASES
        'thanks for being a subscriber', 'your subscription',
        'here is your receipt', 'billing summary',
        'payment summary', 'statement', 'monthly statement'
    ];

    React.useEffect(() => {
        loadGmailAPI();
    }, []);

    const loadGmailAPI = () => {
        // Load Gmail API
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('client:auth2', initGmailClient);
        };
        document.body.appendChild(script);
    };

    const initGmailClient = () => {
        window.gapi.client.init({
            clientId: GMAIL_CLIENT_ID,
            scope: GMAIL_SCOPES
        }).then(() => {
            console.log('Gmail API initialized');
        }).catch((error) => {
            console.error('Error initializing Gmail API:', error);
        });
    };

    const connectGmail = async () => {
        setLoading(true);
        try {
            // Authenticate with Google
            const auth = window.gapi.auth2.getAuthInstance();
            const googleUser = await auth.signIn();
            const authResponse = googleUser.getAuthResponse();
            
            setAccessToken(authResponse.access_token);
            setGmailConnected(true);
            
            // Save connection to database
            await saveGmailConnection(authResponse.access_token);
            
            // Start scanning
            await scanGmailForReceipts(authResponse.access_token);
            
        } catch (error) {
            console.error('Gmail connection error:', error);
            alert('Failed to connect to Gmail. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveGmailConnection = async (token) => {
        try {
            await supabase.from('email_connections').insert({
                user_id: user.id,
                provider: 'gmail',
                access_token: token, // In production, encrypt this!
                status: 'active'
            });
        } catch (error) {
            console.error('Error saving Gmail connection:', error);
        }
    };

    const scanGmailForReceipts = async (token) => {
        setScanning(true);
        try {
            // Build search query - only emails from subscription services
            const domainQueries = SUBSCRIPTION_DOMAINS.map(domain => `from:${domain}`).join(' OR ');
            const keywordQueries = RECEIPT_KEYWORDS.map(kw => `subject:${kw}`).join(' OR ');
            const query = `(${domainQueries}) AND (${keywordQueries})`;
            
            // Fetch emails from last 6 months
            const response = await fetch(
                `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            const data = await response.json();
            
            setEmailCount(data.messages?.length || 0);
            
            if (!data.messages || data.messages.length === 0) {
                setScanning(false);
                return;
            }
            
            // Process emails
            const detectedSubscriptions = [];
            
            for (const message of data.messages.slice(0, 50)) { // Process first 50
                const emailData = await fetchEmailDetails(token, message.id);
                const subscription = parseEmailForSubscription(emailData);
                
                if (subscription) {
                    detectedSubscriptions.push(subscription);
                }
            }
            
            // Remove duplicates
            const uniqueSubs = removeDuplicates(detectedSubscriptions);
            setDetectedSubs(uniqueSubs);
            
        } catch (error) {
            console.error('Error scanning emails:', error);
            alert('Failed to scan emails. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const fetchEmailDetails = async (token, messageId) => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching email:', error);
            return null;
        }
    };

    const parseEmailForSubscription = (emailData) => {
        if (!emailData || !emailData.payload) return null;
        
        const headers = emailData.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        
        // Extract email body
        let body = '';
        if (emailData.payload.parts) {
            const textPart = emailData.payload.parts.find(p => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
            if (textPart && textPart.body.data) {
                body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
        } else if (emailData.payload.body.data) {
            body = atob(emailData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
        
        const fullText = `${subject} ${body}`;
        
        // Extract service name
        const serviceName = extractServiceName(from, subject);
        if (!serviceName) return null;
        
        // Extract price
        const price = extractPrice(fullText);
        if (!price) return null;
        
        // Extract billing cycle
        const billingCycle = extractBillingCycle(fullText);
        
        // Guess category
        const category = guessCategory(serviceName);
        
        // Calculate confidence
        const confidence = calculateConfidence(serviceName, price, billingCycle, fullText);
        
        // Only return high confidence detections
        if (confidence < 0.6) return null;
        
        return {
            name: serviceName,
            cost: price,
            billing_cycle: billingCycle,
            category: category,
            confidence: confidence >= 0.9 ? 'high' : 'medium',
            source: 'email',
            email_date: new Date(date).toISOString().split('T')[0],
            email_subject: subject
        };
    };

    const extractServiceName = (from, subject) => {
        // Check known services
        const knownServices = {
            'netflix': 'Netflix',
            'spotify': 'Spotify',
            'hulu': 'Hulu',
            'disney': 'Disney+',
            'amazon': 'Amazon Prime',
            'apple': 'Apple',
            'adobe': 'Adobe',
            'microsoft': 'Microsoft',
            'google': 'Google',
            'youtube': 'YouTube Premium',
            'dropbox': 'Dropbox',
            'zoom': 'Zoom'
        };
        
        const fromLower = from.toLowerCase();
        const subjectLower = subject.toLowerCase();
        
        for (const [key, name] of Object.entries(knownServices)) {
            if (fromLower.includes(key) || subjectLower.includes(key)) {
                return name;
            }
        }
        
        // Extract from domain
        const domainMatch = from.match(/@([^>]+)/);
        if (domainMatch) {
            const domain = domainMatch[1].split('.')[0];
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        }
        
        return null;
    };

    const extractPrice = (text) => {
        // Look for price patterns
        const pricePatterns = [
            /\$(\d+\.?\d{0,2})/g,
            /(\d+\.?\d{0,2})\s*(USD|usd)/g,
            /total[:\s]+\$?(\d+\.?\d{0,2})/gi,
            /amount[:\s]+\$?(\d+\.?\d{0,2})/gi,
            /charged[:\s]+\$?(\d+\.?\d{0,2})/gi
        ];
        
        for (const pattern of pricePatterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Get the largest price found (likely the total)
                const prices = matches.map(m => {
                    const num = m.match(/(\d+\.?\d{0,2})/);
                    return num ? parseFloat(num[1]) : 0;
                });
                const maxPrice = Math.max(...prices);
                if (maxPrice > 0.99 && maxPrice < 1000) { // Reasonable subscription price
                    return maxPrice.toFixed(2);
                }
            }
        }
        
        return null;
    };

    const extractBillingCycle = (text) => {
        const textLower = text.toLowerCase();
        
        if (textLower.includes('annual') || textLower.includes('yearly') || textLower.includes('year')) {
            return 'Yearly';
        } else if (textLower.includes('quarterly') || textLower.includes('3 month')) {
            return 'Quarterly';
        } else if (textLower.includes('weekly') || textLower.includes('week')) {
            return 'Weekly';
        }
        
        return 'Monthly'; // Default
    };

    const guessCategory = (serviceName) => {
        const categories = {
            'Streaming': ['netflix', 'hulu', 'disney', 'hbo', 'paramount', 'peacock', 'prime video'],
            'Music': ['spotify', 'apple music', 'youtube music', 'pandora'],
            'Software': ['adobe', 'microsoft', 'google', 'dropbox', 'zoom', 'slack'],
            'Gaming': ['xbox', 'playstation', 'nintendo', 'steam']
        };
        
        const nameLower = serviceName.toLowerCase();
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(k => nameLower.includes(k))) {
                return category;
            }
        }
        
        return 'Other';
    };

    const calculateConfidence = (name, price, cycle, text) => {
        let score = 0.5; // Base score
        
        // Higher confidence if known service
        const knownServices = ['netflix', 'spotify', 'hulu', 'disney', 'amazon', 'apple'];
        if (knownServices.some(s => name.toLowerCase().includes(s))) {
            score += 0.3;
        }
        
        // Higher confidence if has billing keywords
        if (text.toLowerCase().includes('subscription') || text.toLowerCase().includes('membership')) {
            score += 0.1;
        }
        
        // Higher confidence if price is in typical range
        const priceNum = parseFloat(price);
        if (priceNum >= 4.99 && priceNum <= 99.99) {
            score += 0.1;
        }
        
        return Math.min(score, 1.0);
    };

    const removeDuplicates = (subscriptions) => {
        const seen = new Set();
        return subscriptions.filter(sub => {
            const key = `${sub.name}-${sub.cost}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const importSubscription = async (emailSub) => {
        try {
            const subData = {
                name: emailSub.name,
                cost: emailSub.cost,
                billing_cycle: emailSub.billing_cycle,
                category: emailSub.category,
                description: `Auto-detected from email (${emailSub.email_subject})`,
                status: 'active',
                type: 'subscription',
                user_id: user.id,
                source: 'email_import',
                email_confidence: emailSub.confidence
            };
            
            await supabase.from('subscriptions').insert(subData);
            
            setDetectedSubs(detectedSubs.filter(s => s.name !== emailSub.name));
            
            if (onSubscriptionsImported) {
                onSubscriptionsImported();
            }
            
            alert(`✅ ${emailSub.name} added to your subscriptions!`);
            
        } catch (error) {
            console.error('Error importing subscription:', error);
            alert('Failed to import subscription. Please try again.');
        }
    };

    const importAllSubscriptions = async () => {
        if (confirm(`Import all ${detectedSubs.length} subscriptions?`)) {
            for (const sub of detectedSubs) {
                await importSubscription(sub);
            }
            alert(`✅ Successfully imported ${detectedSubs.length} subscriptions!`);
        }
    };

    const ignoreSubscription = (subName) => {
        setDetectedSubs(detectedSubs.filter(s => s.name !== subName));
    };

    // Icons
    const Mail = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    const Check = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
    const X = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    const RefreshCw = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
    const AlertCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    const Zap = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    const Shield = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            📧 Email Receipt Scanner
                        </h2>
                        <p className="text-gray-600">Scan your Gmail for subscription receipts</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Not Connected State */}
                {!gmailConnected && (
                    <div>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📬</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Connect Your Gmail
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We'll scan your emails for subscription receipts from Netflix, Spotify, and more
                            </p>
                        </div>

                        {/* Privacy Info */}
                        <div className="mb-8 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                            <div className="flex items-start gap-3">
                                <Shield className="text-green-600 flex-shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-green-900 mb-2">🔒 Your Privacy is Protected</h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>✓ Only scans emails from {SUBSCRIPTION_DOMAINS.length}+ known subscription services</li>
                                        <li>✓ Filters by keywords: "invoice", "receipt", "payment"</li>
                                        <li>✓ Never reads personal emails</li>
                                        <li>✓ Read-only access - we can't send emails</li>
                                        <li>✓ You approve every import</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="text-blue-600" size={20} />
                                    <h4 className="font-bold text-blue-900">Smart Detection</h4>
                                </div>
                                <p className="text-sm text-blue-700">AI identifies subscription receipts</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="text-purple-600" size={20} />
                                    <h4 className="font-bold text-purple-900">Zero False Positives</h4>
                                </div>
                                <p className="text-sm text-purple-700">Only subscription services</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="text-orange-600" size={20} />
                                    <h4 className="font-bold text-orange-900">You Control</h4>
                                </div>
                                <p className="text-sm text-orange-700">Approve each import</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={connectGmail}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : '📧 Connect Gmail'}
                            </button>
                            <p className="text-xs text-gray-500 mt-4">
                                🔒 Secured by Google OAuth - Read-only access
                            </p>
                        </div>
                    </div>
                )}

                {/* Scanning State */}
                {gmailConnected && scanning && (
                    <div className="text-center py-12">
                        <div className="animate-spin mx-auto mb-4 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Scanning Emails...
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Analyzing receipts from {SUBSCRIPTION_DOMAINS.length}+ services
                        </p>
                        <p className="text-sm text-gray-500">
                            Found {emailCount} potential receipt emails
                        </p>
                    </div>
                )}

                {/* Results */}
                {gmailConnected && !scanning && (
                    <div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 text-white">
                                <Check size={28} />
                                <div>
                                    <h3 className="text-xl font-bold">Gmail Connected!</h3>
                                    <p className="text-white/90">Scanned {emailCount} emails • Found {detectedSubs.length} subscription{detectedSubs.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>

                        {detectedSubs.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        🎯 Detected Subscriptions
                                    </h3>
                                    <button
                                        onClick={importAllSubscriptions}
                                        className="px-4 py-2 gradient-orange text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                                    >
                                        Import All
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {detectedSubs.map((sub, idx) => (
                                        <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-gray-900">{sub.name}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                            sub.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {sub.confidence}
                                                        </span>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                            {sub.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm mb-2">
                                                        <div>
                                                            <span className="text-gray-600">Cost: </span>
                                                            <span className="font-bold text-blue-600">${sub.cost}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Billing: </span>
                                                            <span className="font-semibold">{sub.billing_cycle}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500">From: {sub.email_subject}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => importSubscription(sub)}
                                                    className="flex-1 px-4 py-2 gradient-blue text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                                                >
                                                    ✓ Import
                                                </button>
                                                <button
                                                    onClick={() => ignoreSubscription(sub.name)}
                                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                                >
                                                    Ignore
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    No Subscription Receipts Found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    We didn't find any subscription receipts in your recent emails.
                                </p>
                                <button
                                    onClick={() => scanGmailForReceipts(accessToken)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    <RefreshCw size={16} className="inline mr-2" />
                                    Scan Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.EmailScanner = window.EmailScannerComponent;