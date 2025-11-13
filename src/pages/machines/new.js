import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MachineForm from '../../components/MachineForm';
import { FiArrowLeft } from 'react-icons/fi';

export default function NewMachinePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/machines');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="btn btn-secondary btn-sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Machines
        </button>

        {/* Form */}
        <MachineForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}