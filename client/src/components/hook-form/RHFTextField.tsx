import type { TextFieldProps } from "@mui/material/TextField";
import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";

export type RHFTextFieldProps = TextFieldProps & {
   name: string;
};

export function RHFTextField({
   name,
   helperText,
   slotProps,
   type = "text",
   ...other
}: RHFTextFieldProps) {
   const { control } = useFormContext();

   return (
      <Controller
         name={name}
         control={control}
         render={({ field, fieldState: { error } }) => (
            <TextField
               {...field}
               fullWidth
               value={field.value ?? ""}
               type={type}
               error={!!error}
               helperText={error?.message ?? helperText}
               slotProps={{
                  ...slotProps,
                  htmlInput: {
                     autoComplete: "off",
                     ...slotProps?.htmlInput,
                  },
               }}
               {...other}
            />
         )}
      />
   );
}
