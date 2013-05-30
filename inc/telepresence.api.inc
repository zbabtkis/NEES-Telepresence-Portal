<?php
/**
 * @file
 *	Provides RESTApi for telepresence.
 */


function telepresence_api($id = null) {
	switch($_SERVER['REQUEST_METHOD']) {
		case 'POST':
			$camera = telepresence_save_camera($id, $_POST);

			break;

		case 'PUT':
			$json = file_get_contents("php://input");

			$values = json_decode($json, true);

			$camera = telepresence_save_camera($id, $values);

			break;

		case 'GET':
			$camera = telepresence_find_camera($id);
			$json = json_encode($camera);

			print $json;

			break;

		case 'DELETE':
			telepresence_remove_camera($id);

		default:
			break;
	}
}

/**
 * Camera Actions
 */

function telepresence_find_camera($id = null) {
	$camera = array();

	if($id) {
		$camera = db_select('cameras', 'c')
			->fields('c')
			->condition('id', $id, '=')
			->execute()->fetchAssoc();
	} else {
		$cameras = db_select('cameras', 'c')
			->fields('c')
			->execute();

		while($c = $cameras->fetchAssoc()) {
			$camera[] = $c;
		}
	}

	return $camera;
}

function telepresence_save_camera($id = null, $values) {
	$camera = array();

	$pan   = ($values['value_pan'] != '')   ? $values['value_pan']   : 50;
	$tilt  = ($values['value_tilt'] != '')  ? $values['value_tilt']  : 50;
	$zoom  = ($values['value_zoom'] != '')  ? $values['value_zoom']  : 0;
	$focus = ($values['value_focus'] != '') ? $values['value_focus'] : 0;

	$private_query = array(
		'site_name'        => $values['site_name'],
		'site_safe_name'   => $values['site_safe_name'],
		'camera_name'      => $values['camera_name'],
		'camera_safe_name' => $values['camera_safe_name'],
		'value_pan'        => $pan,
		'value_tilt'       => $tilt,
		'value_zoom'       => $zoom,
		'value_focus'      => $focus
		);

	$public_query = array(
		'value_pan'        => $pan,
		'value_tilt'       => $tilt,
		'value_zoom'       => $zoom,
		'value_focus'      => $focus
		);

	$query = user_access('administer telepresence') ? $private_query : $public_query;

	if($id) {
		$camera = db_update('cameras')
			->fields($query)
			->condition('id', $id, '=');
	} else {
		$camera = db_insert('cameras')
			->fields($query);
	}

	$camera->execute();

	return $camera;
}

function telepresence_remove_camera($id) {
	$camera = db_delete('cameras')
		->condition('id', $id, '=');

	if(!user_access('administer_telepresence')) {
		return array('result' => 'You do not have permission to delete cameras');
	}

	if($camera->execute()) {
		drupal_set_message('Camera deleted');

		return array('result' => 'Camera deleted.');
	} else {
		return array('result' => 'Camera deletion failed');
	}
}