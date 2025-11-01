using Th11s.FileSling.Web.Components;
using Th11s.FileSling.Web.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthentication()
    .AddCookie(options =>
    {
#if DEBUG
        options.LoginPath = "/fakelogin";
#else
        options.LoginPath = "/login";
#endif

        options.LogoutPath = "/logout";
    });
builder.Services.AddAuthorization();

builder.Services.AddRazorComponents();
builder.Services.AddCascadingAuthenticationState();

var app = builder.Build();

app.MapStaticAssets()
    .ShortCircuit();

app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();


app.MapRazorComponents<App>();
app.MapFileSlingApi();

app.Run();
