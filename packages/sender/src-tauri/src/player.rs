use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::State;

pub struct PlayerState {
    process: Mutex<Option<Child>>,
}

impl PlayerState {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn start_player(srt_url: String, state: State<'_, PlayerState>) -> Result<String, String> {
    let mut proc = state.process.lock().map_err(|e| e.to_string())?;
    if proc.is_some() {
        return Err("Player already running".into());
    }

    // mpv plays the SRT stream from MediaMTX
    // srt_url example: "srt://vps-ip:8890?streamid=read:myroom&latency=200000"
    let child = Command::new("mpv")
        .args([
            &srt_url,
            "--no-terminal",
            "--force-window=yes",
            "--keep-open=yes",
            "--title=DET Screen Viewer",
            "--geometry=800x600",
            "--demuxer-lavf-o=timeout=5000000",
            "--profile=low-latency",
            "--cache=no",
            "--untimed",
        ])
        .spawn()
        .map_err(|e| format!("Failed to start mpv: {}", e))?;

    *proc = Some(child);
    Ok("Player started".into())
}

#[tauri::command]
pub fn stop_player(state: State<'_, PlayerState>) -> Result<String, String> {
    let mut proc = state.process.lock().map_err(|e| e.to_string())?;
    if let Some(mut child) = proc.take() {
        child.kill().map_err(|e| e.to_string())?;
        child.wait().ok();
        Ok("Player stopped".into())
    } else {
        Err("Player not running".into())
    }
}

#[tauri::command]
pub fn get_player_status(state: State<'_, PlayerState>) -> bool {
    let proc = state.process.lock().unwrap();
    if let Some(_child) = proc.as_ref() {
        // Check if process is still running
        // We can't call try_wait on a borrowed &Child, so just check if it exists
        true
    } else {
        false
    }
}

#[tauri::command]
pub fn set_player_volume(_volume: u32, _state: State<'_, PlayerState>) -> Result<(), String> {
    // For now this is a placeholder - mpv IPC would be needed for runtime control
    // We could use mpv's --input-ipc-server for this
    Ok(())
}
