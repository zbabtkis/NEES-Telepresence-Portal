<script data-main="/<?php print $module_path; ?>/js/app" src="/<?php print $module_path; ?>/js/vendor/Require/require.js"></script>

<div id="telepresence-wrap">
	<aside id='telepresence-menu'>
		<nav id='tp-tabs'>
			<i id='help-tab' class='icon icon-info-sign icon-2x' alt='Show Help' title='Show Help'></i>
			<h4></h4>
			<i id='list-tab' class='icon icon-list icon-2x' alt='Show Sites List' title='Show Sites List'></i>
		</nav>
		<section id='telepresence-dashboard'></section>
		<section id='controls'>

			<h3 class='header-inner'>Controls</h3>

			<div class='input-controls'>
				<div class='input-control'>
					<label for='frmaerate-selector'>Framerate</label>
					<div id='framerate-selector' class='framerate-selector' value='10'></div>
				</div>

				<div class='input-control'>
					<label for='location-picker'>Location</label>
					<div id='location-picker' class='location-picker'></div>
				</div>
			</div>

			<div class='slider-controls'>
				<div class='control'>
					<label for='iris-control'>Iris</label>
					<div id='iris-control' class='mini-control iris-control'></div>
				</div>

				<div class='control'>
					<label for='focus-control'>Focus</label>
					<div id='focus-control' class='mini-control focus-control'></div>
				</div>
				
				<div class='control'>
					<label for='zoom-control'>Zoom</label>
					<div id='zoom-control' class='mini-control zoom-control'></div>
				</div>
			</div>

			<div id='capture'>
				<h3 class='header-inner'>Capture</h3>
				<div class='video-controls'>
				</div>
				<div id='screenshots'>
				</div>
			</div>

		</section>
	</aside>
	<div id="video">

		<div class='left-col'>
			<label for='slider-pan'>Pan</label>
			<div id="slider-pan" class='slider-pan'></div>
		</div>
		<div class='tp-row'>
			<div id="stream" class='left-col'>
				<h1 class='telepresence-message'>Select a stream</h1>
			</div>

			<div class='right-col'>
				<label for='slider-tilt'>T<br>I<br>L<br>T</label>
				<div id="slider-tilt" class='slider-tilt'></div>
			</div>
		</div>

		<div id="player-controls">
			<div class="transparentBar"></div>
		</div>
	</div>
</div>