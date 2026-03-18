#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod capture;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(capture::CaptureState::new())
        .invoke_handler(tauri::generate_handler![
            capture::start_capture,
            capture::stop_capture,
            capture::get_capture_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
