from diffusers import AnimateDiffPipeline
import os

def image_to_gif(
    image_path,
    output_path=None,
    model_id="stabilityai/sdxl-turbo",
    num_frames=16,
    fps=8
):
    """
    Convert a still image to a short animated GIF using AnimateDiff.

    Args:
        image_path (str): Path to the input image file.
        output_path (str, optional): Path to save the output GIF. If None, a default path is generated.
        model_id (str): Base model ID from HuggingFace.
        num_frames (int): Number of frames to generate.
        fps (int): Frames per second in the output GIF.

    Returns:
        str: Path to the generated GIF file.
    """
    from PIL import Image
    import os
    import torch
    import imageio

    # Check if the input image exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Input image not found at {image_path}")

    # Set default output path if not provided
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_path = os.path.join(os.path.dirname(image_path), f"{base_name}_animated.gif")

    # Load the image
    init_image = Image.open(image_path).convert("RGB")

    # Load the AnimateDiff pipeline
    pipe = AnimateDiffPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

    # Generate frames
    print(f"Generating GIF from image: {image_path}")
    frames = pipe(
        image=init_image,
        num_frames=num_frames,
        num_inference_steps=25
    ).frames[0]

    # Save frames as a GIF
    print(f"Saving GIF to: {output_path}")
    imageio.mimsave(output_path, [frame for frame in frames], fps=fps)

    return output_path

if __name__ == "__main__":
    # Example usage
    test_image_path = r"D:\Self\Hack\Airavat_GitItDone_Shubham-Karampure\Flask\test.jpg"
    if os.path.exists(test_image_path):
        gif_path = image_to_gif(test_image_path)
        print(f"GIF generated successfully: {gif_path}")
    else:
        print(f"Test image not found at {test_image_path}. Please provide a valid image path.")