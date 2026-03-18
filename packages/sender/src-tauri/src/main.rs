#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod player;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(player::PlayerState::new())
        .invoke_handler(tauri::generate_handler![
            player::start_player,
            player::stop_player,
            player::get_player_status,
            player::set_player_volume,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
