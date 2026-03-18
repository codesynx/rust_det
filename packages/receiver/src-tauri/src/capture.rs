use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::State;

pub struct CaptureState {
    process: Mutex<Option<Child>>,
}

impl CaptureState {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn start_capture(
    srt_url: String,
    state: State<'_, CaptureState>,
) -> Result<String, String> {
    let mut proc = state.process.lock().map_err(|e| e.to_string())?;
    if proc.is_some() {
        return Err("Already capturing".into());
    }

    let child = build_ffmpeg_command(&srt_url)
        .spawn()
        .map_err(|e| format!("Failed to start FFmpeg: {}", e))?;

    *proc = Some(child);
    Ok("Capture started".into())
}

#[tauri::command]
pub fn stop_capture(state: State<'_, CaptureState>) -> Result<String, String> {
    let mut proc = state.process.lock().map_err(|e| e.to_string())?;
    if let Some(mut child) = proc.take() {
        child.kill().map_err(|e| e.to_string())?;
        child.wait().ok();
        Ok("Capture stopped".into())
    } else {
        Err("Not capturing".into())
    }
}

#[tauri::command]
pub fn get_capture_status(state: State<'_, CaptureState>) -> bool {
    let proc = state.process.lock().unwrap();
    proc.is_some()
}

fn build_ffmpeg_command(srt_url: &str) -> Command {
    let mut cmd = Command::new("ffmpeg");
    cmd.args(["-y", "-hide_banner", "-loglevel", "warning"]);

    #[cfg(target_os = "macos")]
    {
        cmd.args([
            "-f", "avfoundation",
            "-framerate", "30",
            "-capture_cursor", "1",
            "-i", "1:0", // screen:audio (device indices)
        ]);
    }

    #[cfg(target_os = "windows")]
    {
        cmd.args([
            "-f", "gdigrab",
            "-framerate", "30",
            "-i", "desktop",
            "-f", "dshow",
            "-i", "audio=virtual-audio-capturer",
        ]);
    }

    #[cfg(target_os = "linux")]
    {
        cmd.args([
            "-f", "x11grab",
            "-framerate", "30",
            "-i", ":0.0",
            "-f", "pulse",
            "-i", "default",
        ]);
    }

    cmd.args([
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        "-b:v", "3000k",
        "-maxrate", "3000k",
        "-bufsize", "6000k",
        "-g", "60",
        "-c:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
        "-f", "mpegts",
        srt_url,
    ]);

    cmd
}
