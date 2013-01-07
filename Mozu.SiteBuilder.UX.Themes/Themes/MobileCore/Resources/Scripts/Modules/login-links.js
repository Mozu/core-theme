define(['jquery'], function ($) {
    $(document).ready(function () {
        $('[data-mz-action="logout"]').on('click', function () {
            $.ajax({
                type: 'POST',
                url: '/Auth/LogOut',
                data: {},
                success: function (response) {
                    if (response.success) {
                        window.location.reload(true);
                    } else {
                        console.log(response.message);
                    }
                },
                dataType: 'json'
            });

            return false;
        });
        $('[data-mz-action="login"]').on('click', function () {
            window.location = "/auth/signin?ReturnUrl=" + encodeURIComponent(window.location.path + window.location.search);
        });
    });
});