import React from "react";
import { fetchAdminProductDetails, updateProductAction } from "@/utils/actions";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Button";
import CheckboxInput from "@/components/form/CheckBoxInput";

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const product = await fetchAdminProductDetails(id);
  const { name, description, company, price, featured } = product;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">update product</h1>
      <div className="border p-8 rounded-md">
        <FormContainer action={updateProductAction}>
          <div className="grid gap-4 md:grid-cols-2 my-4">
            <input type="hidden" name="id" value={product.id} />
            <FormInput
              type="text"
              label="name"
              name="name"
              defaultValue={name}
            />
            <FormInput
              type="text"
              label="company"
              name="company"
              defaultValue={company}
            />
            <PriceInput defaultValue={price} />
          </div>
          <TextAreaInput
            name="description"
            labelText="product description"
            defaultValue={description}
          />
          <div className="mt-6">
            <CheckboxInput
              name="featured"
              label="featured"
              defaultChecked={featured}
            />
          </div>
          <SubmitButton text="update product" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
};

export default EditProductPage;
