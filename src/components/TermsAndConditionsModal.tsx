import { X } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal = ({ isOpen, onClose }: TermsAndConditionsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black z-20 sticky"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <h2 className="text-2xl font-black text-black mb-6">Terms & Conditions</h2>
          <p className="text-sm text-gray-600 mb-6">Pre-Christmas Musical Night (20th December 2025)</p>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            {/* Section 1 */}
            <div>
              <h3 className="font-bold text-black mb-2">1. Event Postponement</h3>
              <p>
                In case of unforeseen or uncertain circumstances (such as weather issues, technical difficulties, venue-related problems, or other factors beyond the organizers' control), the event <span className="font-bold">may be postponed</span>.
                However, the event <span className="font-bold">will not be canceled</span>. All purchased tickets will remain valid for the rescheduled date, and attendees will be informed in advance of the updated schedule.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-bold text-black mb-2">2. Entry Requirements</h3>
              <p>
                Attendees must present a valid ticket (digital or printed) at the entrance. The organizers reserve the right to deny entry to anyone without a valid ticket.
              </p>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-bold text-black mb-2">3. Safety & Conduct</h3>
              <p>
                Guests are expected to maintain respectful behavior throughout the event. Any form of misconduct, disturbance, or violation of safety rules may result in removal from the venue without refund.
              </p>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="font-bold text-black mb-2">4. Program Changes</h3>
              <p>
                The organizers reserve the right to modify the event program, lineup, timing, or venue if necessary. Such changes will not qualify for a refund.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="font-bold text-black mb-2">5. No Refund Policy</h3>
              <p>
                All ticket purchases are <span className="font-bold">strictly non-refundable</span>. Once purchased, tickets cannot be returned, exchanged, or refunded under any circumstances, including postponement of the event.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="font-bold text-black mb-2">6. Liability</h3>
              <p>
                The organizers are not responsible for any loss, damage, theft of personal belongings, or injuries occurring during the event.
              </p>
            </div>

            {/* Section 7 */}
            <div>
              <h3 className="font-bold text-black mb-2">7. Recording & Photography</h3>
              <p>
                Unauthorized professional photography, videography, or audio recording is prohibited. The organizers may capture photos and videos for promotional use, and attendees consent to this by attending the event.
              </p>
            </div>

            {/* Section 8 */}
            <div>
              <h3 className="font-bold text-black mb-2">8. Acknowledgment</h3>
              <p>
                By purchasing a ticket and attending the event, you agree to abide by these Terms & Conditions.
              </p>
            </div>
          </div>

          {/* Close Button at Bottom */}
          <button
            onClick={onClose}
            className="w-full mt-8 px-6 py-3 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
