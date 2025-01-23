/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

// toolkit
import { client } from "@toolkit-dev/examples-backend/client";
import { useNavigate } from "@tanstack/react-router";

/* -----------------------------------------------------------------------------
 * postRoute
 * -------------------------------------------------------------------------- */

export type PostCreateProps = BoxProps;

type PostCreateFormData = z.infer<typeof postCreateFormSchema>;
const postCreateFormSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string().min(1),
});

export function PostCreate({ ...props }: PostCreateProps) {
  const navigate = useNavigate();

  const createPostMutation = useMutation({
    mutationFn: async (data: PostCreateFormData) => {
      const { authorId, ...attributes } = data;
      const response = await client.post.create({
        body: {
          data: {
            type: "post",
            attributes,
            relationships: {
              author: { data: { type: "user", id: authorId } },
            },
          },
        },
      });

      return response.json();
    },
  });

  const onSubmit: SubmitHandler<PostCreateFormData> = async (data) => {
    const { data: post } = await createPostMutation.mutateAsync(data);
    reset();
    navigate({ to: "/post/$postId", params: { postId: post.id } });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postCreateFormSchema),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      {...props}
    >
      <TextField
        {...register("title")}
        label="Title"
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        variant="outlined"
      />
      <TextField
        {...register("authorId")}
        label="Author Id"
        error={Boolean(errors.authorId)}
        helperText={errors.authorId?.message}
        variant="outlined"
      />
      <TextField
        {...register("content")}
        label="Content"
        error={Boolean(errors.content)}
        helperText={errors.content?.message}
        variant="outlined"
        multiline
        rows={4}
      />
      <Button
        sx={{ alignSelf: "flex-end", position: "relative" }}
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        <Box sx={{ visibility: isSubmitting ? "hidden" : "visible" }}>
          Create
        </Box>
        {isSubmitting ? (
          <CircularProgress
            color="inherit"
            size={20}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-10px",
              marginLeft: "-10px",
            }}
          />
        ) : null}
      </Button>
    </Box>
  );
}
