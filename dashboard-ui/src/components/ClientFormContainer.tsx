"use client";

import { useState, useEffect } from "react";
import FormModal from "./FormModal";
import { FormContainerProps } from "./FormContainer";

interface ClientFormContainerProps {
  table: FormContainerProps["table"];
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  onSuccess?: () => void;
  relatedData?: any;
}

const ClientFormContainer = ({ 
  table, 
  type, 
  data, 
  id, 
  onSuccess, 
  relatedData 
}: ClientFormContainerProps) => {
  const [serverData, setServerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from server if needed
  useEffect(() => {
    const fetchData = async () => {
      if (type !== "delete" && !relatedData) {
        try {
          const response = await fetch(`/api/form-data?table=${table}&type=${type}`);
          if (response.ok) {
            const data = await response.json();
            setServerData(data);
          } else {
            console.error('Failed to fetch form data');
          }
        } catch (error) {
          console.error("Error fetching form data:", error);
        }
      } else {
        setServerData(relatedData);
      }
      setLoading(false);
    };

    fetchData();
  }, [table, type, relatedData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Với create type, hiển thị button như bình thường
  return (
    <FormModal
      table={table}
      type={type}
      data={data}
      id={id}
      relatedData={serverData}
      onSuccess={onSuccess}
    />
  );
};

export default ClientFormContainer; 